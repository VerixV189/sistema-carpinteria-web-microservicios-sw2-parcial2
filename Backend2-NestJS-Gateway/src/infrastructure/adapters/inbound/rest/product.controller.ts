import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MarketplaceProduct,
  MongoProductRepository,
} from '../../outbound/persistence/mongo-product.repository';
import { ProcessPaymentHandler } from '../../../../application/payment/commands/process-payment.handler';
import { MarketplaceCheckoutSaga } from '../../../../application/saga/marketplace-checkout.saga';
import { RabbitMQAdapter } from '../../outbound/messaging/rabbitmq.adapter';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../../../auth/roles.guard';
import { JwtPayload } from '../../../../auth/auth.service';

class UpsertProductDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() category!: string;
  @IsString() @IsNotEmpty() woodType!: string;
  @IsString() @IsNotEmpty() dimensions!: string;
  @IsNumber() @Min(1) price!: number;
  @IsOptional() @IsInt() @Min(1) estimatedDays?: number;
  @IsInt() @Min(0) stock!: number;
  @IsString() @IsNotEmpty() description!: string;
  @IsOptional() @IsString() iconName?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() carpenterEmail?: string;
  @IsOptional() @IsString() carpenterName?: string;
}

class CheckoutCartItemDto {
  @IsString() @IsNotEmpty() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}

class MarketplaceCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutCartItemDto)
  @ArrayMinSize(1)
  items!: CheckoutCartItemDto[];

  @IsIn(['PICKUP', 'DELIVERY'])
  deliveryType!: 'PICKUP' | 'DELIVERY';

  @IsOptional() @IsString() deliveryAddress?: string;
  @IsOptional() @IsNumber() deliveryLat?: number;
  @IsOptional() @IsNumber() deliveryLng?: number;
  @IsOptional() @IsString() notes?: string;

  @IsString() @IsNotEmpty() cardNumber!: string;
  @IsString() @IsNotEmpty() cardHolder!: string;
  @IsNumber() expiryMonth!: number;
  @IsNumber() expiryYear!: number;
  @IsString() @IsNotEmpty() cvv!: string;
}

function defaultIconForCategory(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('mesa')) return 'table_restaurant';
  if (c.includes('ropero') || c.includes('estante')) return 'door_sliding';
  if (c.includes('puerta')) return 'door_front_door';
  if (c.includes('cocina')) return 'countertops';
  if (c.includes('escritorio')) return 'desk';
  return 'chair';
}

function mapCategoryToFurnitureType(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('mesa')) return 'TABLE';
  if (c.includes('silla')) return 'CHAIR';
  if (c.includes('ropero')) return 'WARDROBE';
  if (c.includes('puerta')) return 'DOOR';
  if (c.includes('cocina')) return 'KITCHEN';
  if (c.includes('escritorio')) return 'DESK';
  if (c.includes('cama')) return 'BED';
  return 'OTHER';
}

@Controller('api/products')
export class ProductController {
  private readonly log = new Logger(ProductController.name);

  constructor(
    private readonly repository: MongoProductRepository,
    private readonly processPayment: ProcessPaymentHandler,
    private readonly checkoutSaga: MarketplaceCheckoutSaga,
    private readonly events: RabbitMQAdapter,
  ) {}

  /** Historial en vivo de ejecuciones del Patrón Saga (Orquestación + Compensaciones). */
  @Get('sagas')
  getSagaExecutions() {
    return this.checkoutSaga.getRecentExecutions();
  }

  /** Catálogo público del Marketplace (Web y Móvil). */
  @Get()
  async list(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('availableOnly') availableOnly?: string,
  ): Promise<MarketplaceProduct[]> {
    let items = await this.repository.findAll();
    if (category && category !== 'Todos') {
      items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.woodType.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (availableOnly === 'true') {
      items = items.filter((p) => p.stock > 0);
    }
    return items;
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<MarketplaceProduct> {
    const prod = await this.repository.findById(id);
    if (!prod) throw new NotFoundException(`Mueble ${id} no encontrado`);
    return prod;
  }

  /** Crear mueble disponible en el Marketplace (ADMIN o CARPENTER). */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARPENTER')
  async create(
    @Body() dto: UpsertProductDto,
    @Request() req: { user: JwtPayload },
  ): Promise<MarketplaceProduct> {
    const id = `P-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const isCarpenter = req.user.role === 'CARPENTER';
    const carpenterEmail = isCarpenter
      ? req.user.email
      : dto.carpenterEmail?.trim() || undefined;
    const carpenterName =
      dto.carpenterName?.trim() ||
      (isCarpenter ? req.user.email.split('@')[0] : 'Administración Taller');

    const product: MarketplaceProduct = {
      id,
      name: dto.name.trim(),
      category: dto.category.trim(),
      woodType: dto.woodType.trim(),
      dimensions: dto.dimensions.trim(),
      price: Number(dto.price),
      estimatedDays: Number(dto.estimatedDays ?? 10),
      stock: Number(dto.stock),
      description: dto.description.trim(),
      iconName: dto.iconName || defaultIconForCategory(dto.category),
      imageUrl: dto.imageUrl?.trim() || undefined,
      carpenterEmail,
      carpenterName,
      createdByRole: req.user.role === 'ADMIN' ? 'ADMIN' : 'CARPENTER',
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.repository.save(product);
    this.log.log(`Mueble Marketplace creado: ${saved.id} (${saved.name}) por ${req.user.email}`);
    return saved;
  }

  /** Editar mueble del Marketplace (cualquier CARPENTER o ADMIN). */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARPENTER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpsertProductDto,
    @Request() req: { user: JwtPayload },
  ): Promise<MarketplaceProduct> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException(`Mueble ${id} no encontrado`);

    const updated: MarketplaceProduct = {
      ...existing,
      name: dto.name.trim(),
      category: dto.category.trim(),
      woodType: dto.woodType.trim(),
      dimensions: dto.dimensions.trim(),
      price: Number(dto.price),
      estimatedDays: Number(dto.estimatedDays ?? existing.estimatedDays ?? 10),
      stock: Number(dto.stock),
      description: dto.description.trim(),
      iconName: dto.iconName || existing.iconName || defaultIconForCategory(dto.category),
      imageUrl: dto.imageUrl !== undefined ? dto.imageUrl.trim() || undefined : existing.imageUrl,
      carpenterEmail:
        dto.carpenterEmail !== undefined
          ? dto.carpenterEmail.trim() || undefined
          : existing.carpenterEmail,
      carpenterName:
        dto.carpenterName !== undefined
          ? dto.carpenterName.trim() || undefined
          : existing.carpenterName,
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.repository.save(updated);
    this.log.log(`Mueble Marketplace actualizado: ${saved.id} por ${req.user.email}`);
    if (saved.stock <= 2) {
      await this.events.publish('material.low_stock', {
        materialName: `${saved.name} (${saved.woodType})`,
        stock: saved.stock,
        minStock: 3,
      });
    }
    return saved;
  }

  /** Eliminar mueble del Marketplace (cualquier CARPENTER o ADMIN). */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CARPENTER')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<{ deleted: boolean; id: string }> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundException(`Mueble ${id} no encontrado`);
    this.log.log(`Mueble Marketplace eliminado: ${id} por ${req.user.email}`);
    return { deleted: true, id };
  }

  /**
   * Checkout directo del Marketplace coordinado mediante el Patrón de Diseño SAGA
   * (`MarketplaceCheckoutSaga`):
   *  - Paso 1: Reserva stock en MongoDB (Compensación: restaura stock en MongoDB).
   *  - Paso 2: Cobra con tarjeta vía ProcessPaymentHandler y audita en DynamoDB
   *            (Compensación: registra SAGA_COMPENSATED_REFUND en DynamoDB).
   *  - Paso 3: Publica quotation.approved (Java crea Pedido en PostgreSQL) y material.low_stock.
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @Body() dto: MarketplaceCheckoutDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.checkoutSaga.execute({
      clientEmail: req.user.email,
      items: dto.items,
      deliveryType: dto.deliveryType,
      deliveryAddress: dto.deliveryAddress,
      deliveryLat: dto.deliveryLat,
      deliveryLng: dto.deliveryLng,
      notes: dto.notes,
      cardNumber: dto.cardNumber,
      cardHolder: dto.cardHolder,
      expiryMonth: dto.expiryMonth,
      expiryYear: dto.expiryYear,
      cvv: dto.cvv,
    });
  }
}
