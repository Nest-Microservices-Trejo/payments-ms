import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { metadata } from 'reflect-metadata/no-conflict';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

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
      success_url: 'http://localhost:3010/payments/success',
      cancel_url: 'http://localhost:3010/payments/cancel',
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature']!;
    //testing
    //const endpointSecret = 'whsec_5a42994b001a044e11498ca7282df2d8407e48a5be4786386033a5d9522a43dc';

    //real
    const endpointSecret = 'whsec_d5AcfAcKo3fYRgSnWIuvtquQIsP3EMhN';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (error) {
      console.log(`⚠️  Webhook signature verification failed.`, error.message);
      return res.sendStatus(400).send(`Error: ${error.message}`);
    }

    //console.log({ event });

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        //Todo: llamar nuestro microservicio
        console.log({ metadata: chargeSucceeded.metadata });

        break;

      default:
        console.log(`Event ${event.type} not handled`);
    }

    return res.status(200).json({ sig });
  }
}
