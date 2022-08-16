import express from 'express';
import cors from 'cors';
import glob from 'glob';

import { Route } from './core/api';
import errorHandling from './middlewares/errorHandling';
import logger from './core/logger';

const app = express();

app.set('json spaces', 2);

app.use(express.json());
app.use(cors());

const routes = glob.sync(`${__dirname}/routes/**/*.js`);

for (let i = 0; i < routes.length; i++) {
  const module = require(routes[i]);
  const keys = Object.keys(module);

  for (let key of keys) {
    const RouteController = module[key];

    if (RouteController.constructor) {
      const route = new RouteController() as Route;
      route.initialize(app);
      logger.debug(`${route.authorization ? '[A]' : '[N]'} ${route.role ? `[${route.role}]` : '[none]'} ${route.method.toUpperCase()} ${route.url}\t\t\t\t\t`)
    }
  }
}

app.use(errorHandling());

export default app;