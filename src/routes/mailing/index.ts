import { Route, RequestMethod, IRequest } from "../../core/api";
import { check } from "express-validator";
import logger from "../../core/logger";
import { findQueueById } from "../../services";
import { RoleType } from "../../db/entities/Role";
import { QueuePosition } from "../../db/entities/QueuePosition";
import { User } from "../../db/entities/User";
import { broadcastMessage } from "../../core/bot";

const selectors = {
  queues: async () => (await QueuePosition.find({ relations: ['user'] })).map(p => p.user),
  queue: async (id) => (await QueuePosition.find({ where: { queue: await findQueueById(id) },  relations: ['user']  })).map(p => p.user),
  all: () => User.find({ telegram: true }),
};

/** POST /mailing */
export class Post extends Route {
  url = '/mailing';
  method = RequestMethod.POST;
  validation = [
    check('selector').isString(),
    check('queue_id').optional({ nullable: true }).isInt(),
    check('message').isString()
  ];
  authorization = true;
  role = RoleType.ADMIN;

  async onRequest(req: IRequest<any>) {
    const { authorization } = req;
    const { selector, queue_id, message } = req.body; 

    const users = await selectors[selector](queue_id);

    await broadcastMessage(users.map(u => u.id), message, 'HTML');

    logger.info('Mailing sent', { selector, queue_id, message, count: users.length, by: authorization.role.username });

    return { count: users.length }
  }
};
