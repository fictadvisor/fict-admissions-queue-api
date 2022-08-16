import { Route, RequestMethod, IRequest } from "../../core/api";

/** GET /auth */
export class Get extends Route {
  url = '/auth';
  method = RequestMethod.GET;
  authorization = true;

  async onRequest(req: IRequest) {
    return {
      role: req.authorization.role,
      operator: req.authorization.operator,
    };
  }
};

