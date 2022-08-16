import dotenv from 'dotenv';
dotenv.config();

import { createConnection } from "./db";
import logger from "./core/logger";
import app from "./app";
import { updateQueueCache } from './services';
import { cacheRoles } from './services/role';

createConnection()
  .then(async (connection) => {
    logger.info('Connection to the database was established', { database: connection.driver.database });

    await cacheRoles();
    logger.info('Updated roles cache');

    await updateQueueCache();
    logger.info('Updated queue cache');

    const port = process.env.PORT ?? 3000;
    app.listen(port, () => {
      logger.info('Server is running', { port });
    });
  });