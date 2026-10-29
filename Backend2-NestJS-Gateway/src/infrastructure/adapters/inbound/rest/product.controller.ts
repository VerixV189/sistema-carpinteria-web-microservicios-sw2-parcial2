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
    private readonly events: RabbitMQAdapter,
  ) {}

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
   * Checkout directo del Marketplace:
   *  1. Valida stock disponible de cada mueble.
   *  2. Cobra con tarjeta vía ProcessPaymentHandler (guarda log en DynamoDB y
   *     publica payment.completed → Backend4 PHP genera el Recibo PDF).
   *  3. Descuenta el stock de los muebles comprados.
   *  4. Publica quotation.approved con paid=true y carpenterEmail → Backend1 Java
   *     crea el pedido en IN_PRODUCTION y lo auto-asigna al carpintero que subió el mueble.
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @Body() dto: MarketplaceCheckoutDto,
    @Request() req: { user: JwtPayload },
  ) {
    const resolvedItems: Array<{ product: MarketplaceProduct; quantity: number }> = [];
    let totalAmount = 0;

    for (const item of dto.items) {
      const prod = await this.repository.findById(item.productId);
      if (!prod) {
        throw new NotFoundException(`El mueble ${item.productId} ya no existe`);
      }
      if (prod.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${prod.name}" (disponibles: ${prod.stock})`,
        );
      }
      resolvedItems.push({ product: prod, quantity: item.quantity });
      totalAmount += prod.price * item.quantity;
    }

    const marketplaceRef = `MKT-${Date.now()}`;
    const payment = await this.processPayment.execute({
      quotationId: marketplaceRef,
      clientId: req.user.email,
      amount: totalAmount,
      currency: 'BOB',
      cardNumber: dto.cardNumber,
      cardHolder: dto.cardHolder,
      expiryMonth: dto.expiryMonth,
      expiryYear: dto.expiryYear,
      cvv: dto.cvv,
    });

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('El pago fue rechazado por la pasarela');
    }

    // Descontar stock en MongoDB
    for (const entry of resolvedItems) {
      entry.product.stock = Math.max(0, entry.product.stock - entry.quantity);
      await this.repository.save(entry.product);
    }

    // Determinar carpintero autor (si alguno de los muebles fue publicado por un carpintero)
    const carpenterEmail = resolvedItems.find((e) => e.product.carpenterEmail)?.product
      .carpenterEmail;

    const summaryDescription = resolvedItems
      .map((e) => `${e.product.name} (x${e.quantity})`)
      .join(', ');

    // Publicar evento para que Backend1 Java cree el Pedido en IN_PRODUCTION y lo auto-asigne
    await this.events.publish('quotation.approved', {
      quotationId: marketplaceRef,
      clientId: req.user.email,
      totalAmount,
      paid: true,
      carpenterEmail: carpenterEmail ?? null,
      description: `Compra Marketplace: ${summaryDescription}${dto.notes ? ` — ${dto.notes}` : ''}`,
      items: resolvedItems.map((e) => ({
        description: `${e.product.name} (${e.product.dimensions})`,
        furnitureType: mapCategoryToFurnitureType(e.product.category),
        woodType: e.product.woodType.toUpperCase(),
        quantity: e.quantity,
        unitPrice: e.product.price,
        dimensions: { lengthM: 1.5, widthM: 0.8, heightM: 0.8 },
      })),
      delivery: {
        type: dto.deliveryType,
        address:
          dto.deliveryType === 'DELIVERY'
            ? dto.deliveryAddress || 'Envío a domicilio'
            : 'Recojo en taller',
        lat: dto.deliveryLat,
        lng: dto.deliveryLng,
      },
      occurredAt: new Date().toISOString(),
    });

    return {
      status: payment.status,
      paymentId: payment.id.value,
      marketplaceRef,
      totalAmount,
      carpenterEmail: carpenterEmail ?? null,
      items: resolvedItems.map((e) => ({
        productId: e.product.id,
        name: e.product.name,
        quantity: e.quantity,
        unitPrice: e.product.price,
        remainingStock: e.product.stock,
      })),
    };
  }
}
