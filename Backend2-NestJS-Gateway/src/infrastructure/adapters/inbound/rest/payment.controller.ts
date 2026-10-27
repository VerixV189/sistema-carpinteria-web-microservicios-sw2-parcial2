import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProcessPaymentHandler } from '../../../../application/payment/commands/process-payment.handler';
import { PAYMENT_LOG_REPOSITORY, PaymentLogRepository } from '../../../../domain/payment/repositories/payment-log.repository';
import { QUOTATION_REPOSITORY, QuotationRepository } from '../../../../domain/quotation/repositories/quotation.repository';
import { Quotation } from '../../../../domain/quotation/entities/quotation.entity';
import { Payment } from '../../../../domain/payment/entities/payment.entity';
import { ProcessPaymentCommand } from '../../../../application/payment/commands/process-payment.command';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { JwtPayload } from '../../../../auth/auth.service';

class ProcessPaymentDto {
  @IsString() @IsNotEmpty() quotationId!: string;
  @IsOptional() orderId?: number;
  @IsString() @IsNotEmpty() clientId!: string;
  @IsNumber() @Min(0.01) amount!: number;
  @IsOptional() @IsString() currency?: string;
  @IsString() @IsNotEmpty() cardNumber!: string;
  @IsString() @IsNotEmpty() cardHolder!: string;
  @IsNumber() expiryMonth!: number;
  @IsNumber() expiryYear!: number;
  @IsString() @IsNotEmpty() cvv!: string;
}

function toDto(p: Payment) {
  return {
    id: p.id.value,
    quotationId: p.quotationId,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    cardLast4: p.cardLast4,
    gatewayTransactionId: p.gatewayTransactionId,
    createdAt: p.createdAt,
  };
}

/** CU6 — Pasarela de Pago (REST). Servido localmente por el gateway. */
@Controller('api/payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly processPayment: ProcessPaymentHandler,
    @Inject(PAYMENT_LOG_REPOSITORY) private readonly repository: PaymentLogRepository,
    @Inject(QUOTATION_REPOSITORY) private readonly quotations: QuotationRepository,
  ) {}

  /** Un CLIENT solo ve/toca lo suyo: la cotización debe llevar su email. */
  private assertOwn(q: Quotation | null, user: JwtPayload, label: string) {
    if (q == null) throw new NotFoundException(`${label} no encontrada`);
    if (user.role === 'CLIENT' && q.clientId.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('Esta operación no te corresponde');
    }
    return q;
  }

  @Post()
  async pay(@Body() dto: ProcessPaymentDto, @Request() req: { user: JwtPayload }) {
    const q = this.assertOwn(
      await this.quotations.findById(dto.quotationId), req.user, 'Cotización');
    // El monto y el cliente se fijan en el servidor: el body no decide
    // cuánto se cobra ni a nombre de quién.
    if (q.status !== 'APPROVED' && req.user.role === 'CLIENT') {
      throw new BadRequestException(
        'Primero debes aceptar la cotización en "Mis cotizaciones"');
    }
    dto.amount = q.payableAmount();
    if (req.user.role === 'CLIENT') dto.clientId = req.user.email;
    const payment = await this.processPayment.execute(dto as ProcessPaymentCommand);
    return toDto(payment);
  }

  @Get(':id')
  async get(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    const p = await this.repository.findPayment(id);
    if (!p) throw new NotFoundException(`Pago ${id} no encontrado`);
    if (req.user.role === 'CLIENT') {
      this.assertOwn(await this.quotations.findById(p.quotationId), req.user, 'Cotización');
    }
    return toDto(p);
  }

  /** Consulta los logs de transacción de un pago (DynamoDB). */
  @Get(':id/logs')
  async logs(@Param('id') id: string) {
    const logs = await this.repository.logsOf(id);
    return logs.map((l) => ({ event: l.event, detail: l.detail, timestamp: l.timestamp }));
  }

  /** Webhook simulado de la pasarela (llamado también desde n8n). */
  @Post('webhook')
  webhook(@Body() body: { paymentId: string; status: string }) {
    return { received: true, paymentId: body.paymentId, status: body.status };
  }
}
