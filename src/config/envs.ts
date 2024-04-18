import * as Joi from 'joi';
import 'dotenv/config';

interface EnvVars {
  PORT: number;
}

const envSchema = Joi.object({
  PORT: Joi.number().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) throw new Error(`Config calidation error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
};
