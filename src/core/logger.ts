import winston from 'winston';

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple(),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.json(),
  defaultMeta: { time: () => new Date() },
  transports: [
    new winston.transports.Console({ format }),
  ],
});

export default logger;
