import { Route, RequestMethod, IRequest, IResponse } from "../../../core/api";
import { check } from "express-validator";
import { tokens } from "../../../core/registration";
import { pick } from "../../../util/object";
import logger from "../../../core/logger";
import { findUserById } from "../../../services";
import { RoleType } from "../../../db/entities/Role";

/** PUT /users/:id/registration */
export class Post extends Route {
  url = '/users/:id/registration';
  method = RequestMethod.PUT;
  validation = tokens.map(t => check(t.token).optional({ nullable: true }).isString());
  authorization = true;
  role = RoleType.RECEPTION;

  async onRequest(req: IRequest, res: IResponse) {
    const { authorization } = req;
    const user = await findUserById(req.params.id);
    
    const details = pick(req.body, tokens.map(t => t.token), false);

    let incompleteTemplate = [];
    for (let token in details) {
      const t = tokens.find(t => t.token === token);
      if (t.validation && !t.validation(details[token])) {
        incompleteTemplate.push(t);
      }
    }

    if (incompleteTemplate.length > 0) {
      res.status(400).json({
        template: {
          tokens: incompleteTemplate,
        },
      });

      return;
    }

    user.details = Object.assign(user.details, details);

    logger.info('User details updated', { id: user.id, details, by: authorization.role.username });

    await user.save();
    
    return {
      user: user.dto(),
    };
  }
};
