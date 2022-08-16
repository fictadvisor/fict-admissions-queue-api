import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, LessThanOrEqual } from "typeorm";
import { ExtendedEntity } from "./ExtendedEntity";
import { QueuePosition, QueuePositionStatus } from "./QueuePosition";

const positionCache = {};

@Entity("queues")
class Queue extends ExtendedEntity {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column()
  public name: string;

  @Column()
  public active: boolean;

  @Column({ default: false })
  public open: boolean;

  @OneToMany(type => QueuePosition, position => position.queue, { lazy: true })
  public positions: Promise<QueuePosition[]>;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  public dto() {
    return this.pick('id', 'name', 'active', 'open', 'createdAt');
  }

  public getWaitingPositions(size: number) {
    return QueuePosition.find({
      where: { 
        queue: this,
        status: QueuePositionStatus.WAITING,
      },
      order: {
        position: 'ASC',
      },
      take: size,
    });
  }

  public getQueueSize() {
    return QueuePosition.count({ 
      where: { 
        queue: this,
        status: QueuePositionStatus.WAITING,
      } 
    });
  }

  public getLastPosition() {
    return positionCache[this.id] ?? 0;
  }

  public generatePosition() {
    if (!(this.id in positionCache)) {
      positionCache[this.id] = 0;
    }

    return ++positionCache[this.id];
  }

  public async getRelativePosition({ position }: QueuePosition) {
    const count = QueuePosition.count({
      where: { 
        queue: this,
        status: QueuePositionStatus.WAITING,
        position: LessThanOrEqual(position),
      },
    });

    return count;
  }

  public static async updatePositionCache() {
    const queues = await Queue.find();

    for (let queue of queues) {
      const lastPosition = await QueuePosition.findOne({
        where: { queue },
        order: {
          code: 'DESC',
        },
      });

      positionCache[queue.id] = lastPosition ? lastPosition.code : 0;
    }
  }
}

export { Queue };