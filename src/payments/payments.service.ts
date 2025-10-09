import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/services';

@Injectable()
export class PaymentsService {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}
  private readonly stripe = new Stripe(envs.stripeSecret);
  private logger = new Logger('payment-service');

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), //equivale a 20 dolares 2000/100 = 20.00
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: { orderId: orderId },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrL,
    });

    return {
      successUrl: session.success_url,
      cancelUrl: session.cancel_url,
      url: session.url,
    };
  }

  stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature']!;
    //testing
    //const endpointSecret = 'whsec_5a42994b001a044e11498ca7282df2d8407e48a5be4786386033a5d9522a43dc';

    //real
    const endpointSecret = envs.stripeEndpointSecret;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'] as string | Buffer,
        sig,
        endpointSecret,
      );
    } catch (error) {
      if (error instanceof Error) {
        console.log(
          `⚠️  Webhook signature verification failed.`,
          error.message,
        );
        return res.sendStatus(400).send(`Error: ${error.message}`);
      }
      return res.status(400).send('Server error');
    }

    if (!event) {
      return res.status(400).send('Event not defined');
    }

    switch (event.type) {
      case 'charge.succeeded': {
        const chargeSucceeded = event.data.object;
        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receiptUrl: chargeSucceeded.receipt_url,
        };
        this.logger.log('sending data to orders');
        this.client.emit('payment.succeeded', { ...payload });

        break;
      }

      default:
        console.log(`Event ${event.type} not handled`);
    }

    return res.status(200).json({ sig });
  }
}
