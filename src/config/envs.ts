import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  NATS_SERVERS: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  STRIPE_ENDPOINT_SECRET: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) throw new Error(`config validation: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  stripeSecret: envVars.STRIPE_SECRET,
  natsServers: envVars.NATS_SERVERS,
  stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
  stripeCancelUrL: envVars.STRIPE_CANCEL_URL,
  stripeEndpointSecret: envVars.STRIPE_ENDPOINT_SECRET,
};
