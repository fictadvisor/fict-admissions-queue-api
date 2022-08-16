import { ServiceException } from "../../../core/exception";
import { Route, RequestMethod, IRequest } from "../../../core/api";
import { findUserById } from "../../../services";

/** PUT /users/:id/certificate */
export class Post extends Route {
  url = '/users/:id/certificate';
  method = RequestMethod.PUT;
  validation = [];
  authorization = true;

  async onRequest(req: IRequest) {
    const user = await findUserById(req.params.id);
    
    return {
      user: user.dto(),
    };
  }
};
