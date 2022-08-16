import { Route, RequestMethod, IRequest, IQueryParameters } from "../../core/api";
import { check } from "express-validator";
import { User } from "../../db/entities/User";
import { searchQuery } from "../../util/query";
import logger from "../../core/logger";
import { createUser } from "../../services";
import { RoleType } from "../../db/entities/Role";

interface IGetQuery extends IQueryParameters {
  search: string;
  skip: string;
  take: string;
  count: string;
};

interface IPostBody {
  id: string;
  telegram: boolean;
  username: string;
  first_name: string;
  last_name: string;
};

/** GET /users */
export class Get extends Route {
  url = '/users';
  method = RequestMethod.GET;
  validation = [
    check('search').optional().isString(),
    check('skip').optional().isInt(),
    check('take').optional().isInt(),
  ];
  authorization = true;
  role = RoleType.RECEPTION;

  async onRequest(req: IRequest<IGetQuery>) {
    const count = await User.count(searchQuery(['username', 'firstName', 'lastName'], { search: req.query.search }));
    const users = await User.find(searchQuery(['username', 'firstName', 'lastName'], req.query));

    return {
      count,
      users: users.map(u => u.dto()),
    };
  }
};

/** POST /users */
export class Post extends Route {
  url = '/users';
  method = RequestMethod.POST;
  validation = [
    check('id').isString(),
    check('telegram').optional({ nullable: true }).isBoolean(),
    check('username').optional({ nullable: true }).isString().isLength({ min: 1 }),
    check('first_name').isString().isLength({ min: 1 }),
    check('last_name').optional({ nullable: false }).isString().isLength({ min: 1 }),
  ];
  authorization = true;
  role = RoleType.RECEPTION;

  async onRequest(req: IRequest<any, IPostBody>) {
    const { authorization } = req;
    const { id, username, first_name, last_name, telegram } = req.body; 

    const user = await createUser(
      User.create(
        { 
          id, 
          telegram: telegram === false ? false : true,
          username, 
          firstName: first_name,
          lastName: last_name,
        }
      )
    );

    logger.info('User created', { id, by: authorization.role.username });
  
    return {
      user: user.dto(),
    }
  }
};
