import { Queue } from "../../db/entities/Queue";
import { Route, RequestMethod, IRequest } from "../../core/api";
import { check } from "express-validator";
import logger from "../../core/logger";
import { createQueue } from "../../services";
import { RoleType } from "../../db/entities/Role";

interface IPostBody {
  name: string;
};

/** GET /queues */
export class Get extends Route {
  url = '/queues';
  method = RequestMethod.GET;

  async onRequest() {
    const queues = await Queue.find({ order: { active: 'DESC' } });

    return {
      queues: queues.map(q => q.dto()),
    };
  }
};

/** POST /queues */
export class Post extends Route {
  url = '/queues';
  method = RequestMethod.POST;
  validation = [
    check('name').isString().isLength({ min: 1 }),
  ];
  authorization = true;
  role = RoleType.ADMIN;

  async onRequest(req: IRequest<any, IPostBody>) {
    const { authorization } = req;
    const { name } = req.body; 

    const queue = await createQueue(
      Queue.create(
        {
          name,
          active: true,
        }
      )
    );

    logger.info('Queue created', { id: queue.id, name: queue.name, by: authorization.role.username });

    return {
      queue: queue.dto(),
    }
  }
};
