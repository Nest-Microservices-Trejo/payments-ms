import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import type { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  //@Post('create-payment-session')
  @MessagePattern('create.payment.session')
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment successful',
    };
  }

  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment cancelled',
    };
  }

  //@HttpCode(201)
  @Post('stripe-webhook')
  stripeWebhook(@Req() req: Request, @Res() res: Response) {
    //return res.status(200).json({ ok: true, message: 'everything ok' });
    return this.paymentsService.stripeWebhook(req, res);
  }
}
