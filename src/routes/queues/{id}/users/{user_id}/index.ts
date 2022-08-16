import { Route, RequestMethod, IRequest } from "../../../../../core/api";
import { findUserById, findQueueById, deleteQueuePosition, findQueuePosition, notifyQueue } from "../../../../../services";
import logger from "../../../../../core/logger";
import { QueuePositionStatus } from "../../../../../db/entities/QueuePosition";
import { check } from "express-validator";
import { RoleType } from "../../../../../db/entities/Role";

interface IPutBody {
  position?: number;
  status?: QueuePositionStatus;
};

/** DELETE /queues/:id/users/:user_id */
export class Delete extends Route {
  url = '/queues/:id/users/:user_id';
  method = RequestMethod.DELETE;
  authorization = true;
  role = RoleType.OPERATOR;

  async onRequest(req: IRequest) {
    const { authorization } = req;
    const queue = await findQueueById(req.params.id);
    const user = await findUserById(req.params.user_id);

    await queue.consecutive(() => deleteQueuePosition(queue, user));
    await user.sendMessage('deleted', { queue: queue.name });

    logger.info('Queue position deleted', { queue: queue.id, user: user.id, by: authorization.role.username });
  }
};

/** PUT /queues/:id/users/:user_id */
export class Put extends Route {
  url = '/queues/:id/users/:user_id';
  method = RequestMethod.PUT;
  authorization = true;
  role = RoleType.OPERATOR;
  validation = [
    check('position').optional({ nullable: true }).isInt(),
    check('status').optional({ nullable: true }).custom(v => {
      const exists = Object.keys(QueuePositionStatus).map(k => QueuePositionStatus[k]).find(s => s === v);
      
      if (!exists) {
        throw new Error("Invalid QueuePositionStatus enum value");
      }

      return true;
    }),
  ];

  async onRequest(req: IRequest<any, IPutBody>) {
    const { authorization } = req;
    const { position: positionNum, status } = req.body;
    const queue = await findQueueById(req.params.id);
    const user = await findUserById(req.params.user_id);
    const position = await findQueuePosition(queue, user);
    
    let positionDelta = 0;
    if (positionNum && positionNum != position.position) {
      const old = position.position;
      position.position = Math.max(positionNum, 0);

      positionDelta = position.position - old;
    }

    let statusUpdated = false;
    if (status && status != position.status) {
      position.status = status;

      statusUpdated = true;
    }
    
    await queue.consecutive(async () => {
      const pos = await position.save();
      
      if (positionDelta != 0) {
        await user.sendMessage('moved', { queue: queue.name, delta: positionDelta });
      }

      if (statusUpdated || positionDelta != 0) { 
        await notifyQueue(queue); 
        
        if (status === QueuePositionStatus.GOING) {
          await user.sendMessage('processing', { queue: queue.name, operator: authorization.operator, code: position.code });
        }
      }

      return pos;
    });

    logger.info('Queue position updated', { queue: queue.id, user: user.id, data: { position: positionNum, status }, by: authorization.role.username });

    return {
      position: position.dto(),
    };
  }
};

/** GET /queues/:id/users/:user_id */
export class Get extends Route {
  url = '/queues/:id/users/:user_id';
  method = RequestMethod.GET;
  authorization = true;
  role = RoleType.RECEPTION;

  async onRequest(req: IRequest) {
    const queue = await findQueueById(req.params.id);
    const user = await findUserById(req.params.user_id);
    const position = await findQueuePosition(queue, user);

    return {
      queue: queue.dto(),
      user: user.dto(),
      position: position.dto(),
    };
  }
};
