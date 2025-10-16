import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { NatsModule } from './transports/nats.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [PaymentsModule, NatsModule, HealthCheckModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
