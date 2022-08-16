import logger from '../core/logger';

export default () => function(err, req, res, next) {
  const status = err.status ?? 500;
  const message = err.message ? err.message : 'Під час виконання запиту виникла помилка';
  const details = err.details ?? (!err.message ? err.toString() : undefined);

  if (status === 500) {
    logger.error('Internal server error', { msg: message, details });
  }

  if (!res.headersSent) {
    res.status(status).json({ status, message, details });
  }
};

export const asyncHandle = (fn) => async (req, res, next) => {
  try { await fn(req, res, next); }
  catch (err) { next(err); }
};
