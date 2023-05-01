import env from 'dotenv';
import { pino } from 'pino';

env.config();

export default pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  level: process.env.PINO_LOG_LEVEL || 'info',
});
