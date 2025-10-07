import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
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
      ok: true,
      message: 'Payment cancelled',
    };
  }

  //@HttpCode(201)
  @Post('stripe-webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    //return res.status(200).json({ ok: true, message: 'everything ok' });
    return this.paymentsService.stripeWebhook(req, res);
  }
}
