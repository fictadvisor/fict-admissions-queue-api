import { BaseEntity } from "typeorm";
import { ServiceException } from "../../core/exception";
import { pick } from "../../util/object";
import { queue as asyncQueue, AsyncQueue } from 'async';

const asyncQueues = {};

const worker = async ({ fn, resolve, reject }, cb) => {
  try {
    resolve(await fn())
  } catch (err) {
    reject(err);
  }

  cb();
};

const getAsyncQueue = (id): AsyncQueue<any> => {
  if (!asyncQueues[id]) {
    asyncQueues[id] = asyncQueue(worker, 1);
  }

  return asyncQueues[id];
};

export class ExtendedEntity extends BaseEntity {
  public dto() {
    throw ServiceException.build(500, `Method ${this.constructor.name}::dto is not implemented`);
  }

  public pick(...keys: (keyof this)[]) {
    return pick(this, keys);
  }

  public consecutive<T>(fn: () => T, base = false): Promise<T> {
    const id = base ? this.constructor.name : `${this.constructor.name}:${(this as any).id}`;
    const queue = getAsyncQueue(id);
    return new Promise((resolve, reject) => queue.push({ resolve, reject, fn }));
  }
};