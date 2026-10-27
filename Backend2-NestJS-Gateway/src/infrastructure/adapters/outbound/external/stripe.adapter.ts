import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ChargeRequest, ChargeResult, PaymentGatewayPort } from '../../../../application/payment/ports/payment-gateway.port';

/** Tarjetas de prueba Stripe → PaymentMethods compartidos (sin tocar PAN en API). */
const TEST_CARD_PM: Record<string, string> = {
  '4242424242424242': 'pm_card_visa',
  '4000056655665556': 'pm_card_visa_debit',
  '5555555555554444': 'pm_card_mastercard',
  '4000000000009995': 'pm_card_chargeDeclinedInsufficientFunds',
  '4000000000000069': 'pm_card_chargeDeclinedExpiredCard',
};

/**
 * Adaptador OUT — pasarela de pago.
 * - `PAYMENT_GATEWAY=stripe` + STRIPE_SECRET_KEY → PaymentIntent real (test mode).
 * - Sin credenciales → mock (4242… aprueba, otro rechaza).
 */
@Injectable()
export class StripeAdapter implements PaymentGatewayPort {
  private readonly log = new Logger(StripeAdapter.name);
  private readonly stripe: Stripe | null =
    process.env.PAYMENT_GATEWAY === 'stripe' && process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY)
      : null;

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    if (!this.stripe) {
      this.log.log(`Charge MOCK ${request.amount} ${request.currency} ref=${request.reference}`);
      if (request.cardNumber.startsWith('4242')) {
        return { approved: true, transactionId: `mock_tx_${Date.now()}` };
      }
      return { approved: false, error: 'Tarjeta rechazada por la pasarela (mock)' };
    }

    try {
      // PCI: Stripe no acepta PAN crudo salvo que la cuenta habilite
      // "raw card data APIs". En test mode las tarjetas de prueba se
      // mapean a PaymentMethods compartidos (pm_card_*); el resto va a
      // paymentMethods.create por si la cuenta lo tiene habilitado.
      const pmId = TEST_CARD_PM[request.cardNumber]
        ?? (await this.stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: request.cardNumber,
            exp_month: request.expiryMonth,
            exp_year: request.expiryYear,
            cvc: request.cvv,
          },
          billing_details: { name: request.cardHolder },
        })).id;
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // centavos
        currency: request.currency.toLowerCase(),
        confirm: true,
        payment_method: pmId,
        payment_method_types: ['card'],
        description: `Carpintería El Roble — ${request.reference}`,
        metadata: { reference: request.reference },
      });
      const ok = intent.status === 'succeeded';
      return ok
        ? { approved: true, transactionId: intent.id }
        : { approved: false, error: `Stripe status: ${intent.status}` };
    } catch (e) {
      const msg = e instanceof Stripe.errors.StripeCardError ? e.message : (e as Error).message;
      this.log.warn(`Stripe rechazó ${request.reference}: ${msg}`);
      return { approved: false, error: msg };
    }
  }
}
