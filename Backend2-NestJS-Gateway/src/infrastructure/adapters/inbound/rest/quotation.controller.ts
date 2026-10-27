import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuotationHandler } from '../../../../application/quotation/commands/create-quotation.handler';
import { GetQuotationHandler } from '../../../../application/quotation/queries/get-quotation.handler';
import { QUOTATION_REPOSITORY, QuotationRepository } from '../../../../domain/quotation/repositories/quotation.repository';
import { Quotation } from '../../../../domain/quotation/entities/quotation.entity';
import { RabbitMQAdapter } from '../../outbound/messaging/rabbitmq.adapter';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../../../auth/roles.guard';
import { JwtPayload } from '../../../../auth/auth.service';

class DimensionsDto {
  @IsNumber() @Min(0.01) lengthM!: number;
  @IsNumber() @Min(0.01) widthM!: number;
  @IsNumber() @Min(0.01) heightM!: number;
}

class QuotationItemDto {
  @IsString() @IsNotEmpty() description!: string;
  @IsString() furnitureType!: string;
  @IsString() woodType!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsNumber() @Min(0) unitPrice!: number;
  @IsOptional() @ValidateNested() @Type(() => DimensionsDto) dimensions?: DimensionsDto;
  @IsOptional() @IsString() finish?: string;
}

class DeliveryPreferenceDto {
  @IsIn(['PICKUP', 'DELIVERY']) type!: 'PICKUP' | 'DELIVERY';
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
}

class CreateQuotationDto {
  @IsString() @IsNotEmpty() clientId!: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => QuotationItemDto) @ArrayMinSize(1)
  items!: QuotationItemDto[];
  @IsOptional() @IsBoolean() requestEstimate?: boolean;
  @IsOptional() orderId?: number;
  @IsOptional() @ValidateNested() @Type(() => DeliveryPreferenceDto) delivery?: DeliveryPreferenceDto;
}

class SendQuoteDto {
  @IsOptional() @IsNumber() @Min(0) finalAmount?: number;
}

class RespondQuotationDto {
  @IsIn(['accept', 'reject', 'counter']) action!: 'accept' | 'reject' | 'counter';
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsNumber() @Min(0) counterAmount?: number;
}

function toDto(q: Quotation) {
  return {
    id: q.id.value,
    clientId: q.clientId,
    status: q.status,
    photoUrl: q.photoUrl,
    aiEstimate: q.aiEstimate,
    totalAmount: q.totalAmount,
    finalAmount: q.finalAmount ?? null,
    payableAmount: q.payableAmount(),
    delivery: q.delivery ?? null,
    clientMessage: q.clientMessage ?? null,
    counterAmount: q.counterAmount ?? null,
    items: q.items.map((i) => ({
      description: i.description,
      furnitureType: i.specs.furnitureType,
      woodType: i.specs.woodType,
      dimensions: i.specs.dimensions,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal(),
    })),
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

/** CU3 — Gestionar Cotización (REST). Servido localmente por el gateway. */
@Controller('api/quotations')
@UseGuards(JwtAuthGuard)
export class QuotationController {
  private readonly log = new Logger(QuotationController.name);

  constructor(
    private readonly createHandler: CreateQuotationHandler,
    private readonly getHandler: GetQuotationHandler,
    @Inject(QUOTATION_REPOSITORY) private readonly repository: QuotationRepository,
    private readonly events: RabbitMQAdapter,
  ) {}

  /** Un CLIENT solo puede tocar cotizaciones con su email como clientId. */
  private assertOwn(q: Quotation, user: JwtPayload) {
    if (user.role === 'CLIENT' && q.clientId.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('Esta cotización no es tuya');
    }
  }

  @Post()
  async create(@Body() dto: CreateQuotationDto, @Request() req: { user: JwtPayload }) {
    // El cliente no puede cotizar a nombre de otro: su clientId es su email.
    if (req.user.role === 'CLIENT') dto.clientId = req.user.email;
    const q = await this.createHandler.execute(dto);
    if (dto.delivery) {
      q.delivery = dto.delivery;
      await this.repository.save(q);
    }
    return toDto(q);
  }

  @Get()
  async list(@Query('clientId') clientId: string | undefined,
             @Request() req: { user: JwtPayload }) {
    // CLIENT: siempre scopiado a su email — el parámetro se ignora.
    const scoped = req.user.role === 'CLIENT' ? req.user.email : clientId;
    return (await this.getHandler.all(scoped)).map(toDto);
  }

  @Get(':id')
  async get(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    const q = await this.getHandler.byId(id);
    if (!q) throw new NotFoundException(`Cotización ${id} no encontrada`);
    this.assertOwn(q, req.user);
    return toDto(q);
  }

  /** El TALLER fija el precio formal y se lo envía al cliente → QUOTED. */
  @Post(':id/send')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CARPENTER')
  async send(@Param('id') id: string, @Body() body: SendQuoteDto) {
    const q = await this.getHandler.byId(id);
    if (!q) throw new NotFoundException(`Cotización ${id} no encontrada`);
    q.sendQuote(body?.finalAmount);
    return toDto(await this.repository.save(q));
  }

  /** Respuesta del CLIENTE al precio formal: accept | reject | counter. */
  @Post(':id/respond')
  async respond(@Param('id') id: string, @Body() body: RespondQuotationDto,
                @Request() req: { user: JwtPayload }) {
    const q = await this.getHandler.byId(id);
    if (!q) throw new NotFoundException(`Cotización ${id} no encontrada`);
    this.assertOwn(q, req.user);

    if (body.action === 'counter') {
      if (!body.message?.trim()) {
        throw new BadRequestException('La contraoferta necesita un mensaje para el taller');
      }
      q.clientCounter(body.message.trim(), body.counterAmount);
      return toDto(await this.repository.save(q));
    }
    if (body.action === 'reject') {
      q.reject();
      return toDto(await this.repository.save(q));
    }

    // accept → acuerdo cerrado: APPROVED + evento → se crea el pedido
    q.clientAccept();
    const saved = await this.repository.save(q);
    await this.events.publish('quotation.approved', {
      quotationId: q.id.value,
      clientId: q.clientId,
      totalAmount: q.payableAmount(),
      description: q.items[0]?.description ?? 'Pedido desde cotización',
      items: q.items.map((i) => ({
        description: i.description,
        furnitureType: i.specs.furnitureType,
        woodType: i.specs.woodType,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        dimensions: i.specs.dimensions,
      })),
      delivery: q.delivery ?? null,
      occurredAt: new Date().toISOString(),
    });
    return toDto(saved);
  }

  /** Aprobar cotización (admin, compat) → evento quotation.approved → Spring Boot actualiza pedido. */
  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CARPENTER')
  async approve(@Param('id') id: string, @Body() body?: { orderId?: number }) {
    const q = await this.getHandler.byId(id);
    if (!q) throw new NotFoundException(`Cotización ${id} no encontrada`);
    q.approve();
    await this.repository.save(q);
    await this.events.publish('quotation.approved', {
      quotationId: q.id.value,
      orderId: body?.orderId,
      clientId: q.clientId,
      totalAmount: q.totalAmount,
      occurredAt: new Date().toISOString(),
    });
    return toDto(q);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'CARPENTER')
  async reject(@Param('id') id: string) {
    const q = await this.getHandler.byId(id);
    if (!q) throw new NotFoundException(`Cotización ${id} no encontrada`);
    q.reject();
    return toDto(await this.repository.save(q));
  }
}
