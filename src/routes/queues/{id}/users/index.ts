import { Route, RequestMethod, IRequest, IQueryParameters } from "../../../../core/api";
import { check } from "express-validator";
import { QueuePosition } from "../../../../db/entities/QueuePosition";
import { findUserById, findQueueById, createQueuePosition } from "../../../../services";
import { paginationQuery } from "../../../../util/query";
import logger from "../../../../core/logger";
import { RoleType } from "../../../../db/entities/Role";
import { ServiceException } from "../../../../core/exception";

interface IGetQuery extends IQueryParameters {
  skip: string;
  take: string;
};

interface IPostBody {
  id: string;
  force?: boolean;
};

/** GET /queues/:id/users */
export class Get extends Route {
  url = '/queues/:id/users';
  method = RequestMethod.GET;
  validation = [
    check('skip').optional().isInt(),
    check('take').optional().isInt(),
  ];
  authorization = true;
  role = RoleType.RECEPTION;

  async onRequest(req: IRequest<IGetQuery>) {
    const queue = await findQueueById(req.params.id);
    const count = await QueuePosition.count({ queue });
    const positions = await QueuePosition.find(
      paginationQuery(req.query, 
        { 
          where: { queue },
          relations: ['user'], 
          order: {
            position: 'ASC',
          },
        }
      )
    );

    return {
      count,
      positions: await Promise.all(positions.map(async p => ({ ...p.dto(), relativePosition: await queue.getRelativePosition(p), user: p.user.dto() }))),
    };
  }
};

/** POST /queues/:id/users */
export class Post extends Route {
  url = '/queues/:id/users';
  method = RequestMethod.POST;
  validation = [
    check('id').isString(),
    check('force').optional({ nullable: true }).isBoolean(),
  ];
  authorization = true;
  role = RoleType.RECEPTION;

  async onRequest(req: IRequest<any, IPostBody>) {
    const { authorization } = req;
    const { id, force } = req.body;

    const queue = await findQueueById(req.params.id);
    const user = await findUserById(id);

    if (!force) {
      if (!queue.open) {
        throw ServiceException.build(400, 'Черга зачинена');
      }

      if (!queue.active) {
        throw ServiceException.build(400, 'Черга неактивна');
      }
    }

    const position = await createQueuePosition(
      QueuePosition.create(
        {
          queue,
          user,
        }
      )
    );

    logger.info('Queue position created', { queue: queue.id, user: user.id, by: authorization.role.username });
    
    return {
      position: position.dto(),
    };
  }
};
