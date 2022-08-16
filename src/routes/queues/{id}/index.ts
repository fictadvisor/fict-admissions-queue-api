import { Route, RequestMethod, IRequest } from "../../../core/api";
import { check } from "express-validator";
import logger from "../../../core/logger";
import { findQueueById } from "../../../services";
import { RoleType } from "../../../db/entities/Role";

interface IPutBody {
  active?: boolean;
  open?: boolean;
};

/** GET /queues/:id */
export class Get extends Route {
  url = '/queues/:id';
  method = RequestMethod.GET;

  async onRequest(req: IRequest) {
    const queue = await findQueueById(req.params.id);

    return {
      queue: queue.dto(),
      queueSize: await queue.getQueueSize(),
      lastPosition: queue.getLastPosition(),
    };
  }
};

/** PUT /queues/:id */
export class Put extends Route {
  url = '/queues/:id';
  method = RequestMethod.PUT;
  validation = [
    check('active').optional({ nullable: true }).isBoolean(),
    check('open').optional({ nullable: true }).isBoolean(),
  ];
  authorization = true;
  role = RoleType.ADMIN;

  async onRequest(req: IRequest<any, IPutBody>) {
    const { authorization } = req;
    const { active, open } = req.body; 
    const queue = await findQueueById(req.params.id);

    if (active != null) {
      queue.active = active;
    }

    if (open != null) {
      queue.open = open;
    }

    await queue.save();

    logger.info('Queue updated', { id: queue.id, by: authorization.role.username, body: req.body });

    return {
      queue: queue.dto(),
    }
  }
};

/** DELETE /queues/:id */
export class Delete extends Route {
  url = '/queues/:id';
  method = RequestMethod.DELETE;
  authorization = true;
  role = RoleType.ADMIN;

  async onRequest(req: IRequest<any, IPutBody>) {
    const { authorization } = req;
    const queue = await findQueueById(req.params.id);

    await queue.remove();

    logger.info('Queue deleted', { id: queue.id, name: queue.name, by: authorization.role.username });
  }
};
