import { Express, Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
import { asyncHandle } from '../middlewares/errorHandling';
import requestValidation from '../middlewares/requestValidation';
import authorization, { IAuthorization } from '../middlewares/authorization';
import { RoleType } from '../db/entities/Role';
import requireRole from '../middlewares/requireRole';

export interface IQueryParameters { [x: string]: string };

export interface IRequest<Q extends IQueryParameters = any, B = any> extends Request {
  authorization?: IAuthorization;
  query: Q;
  body: B;
};

export interface IResponse extends Response {};

export enum RequestMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  HEAD = 'head',
  ALL = 'all'
};

export type RouteMiddleware = (...args) => any;

export class Route<Q extends IQueryParameters = any, B = any> {
  public url: string;
  public method: RequestMethod;
  public middlewares?: RouteMiddleware[];
  public validation?: ValidationChain[];
  public authorization?: boolean;
  public role?: RoleType;

  public onRequest(req: IRequest<Q, B>, res: IResponse, next: NextFunction): any {};

  public initialize(app: Express) {
    let middleware = [];

    if (this.authorization) {
      middleware.push(authorization());

      if (this.role) {
        middleware.push(requireRole(this.role));
      }
    }

    if (this.validation) {
      middleware.push(this.validation); 
      middleware.push(requestValidation());
    }

    if (this.middlewares && this.middlewares.length > 0) {
      middleware = middleware.concat(this.middlewares);
    }

    const fn = async (req, res, next) => {
      const result = await this.onRequest(req, res, next);
      
      if (res.headersSent) { return; }

      if (typeof(result) === 'object') {
        res.status(200).json(result);
      } else {
        res.status(200).send();
      }
    };

    app[this.method](this.url, ...middleware, asyncHandle(fn));
  }
};
