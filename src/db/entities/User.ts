import { Entity, Column, PrimaryColumn, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ExtendedEntity } from "./ExtendedEntity";
import { QueuePosition } from "./QueuePosition";
import { sendMessage } from "../../core/bot";

interface IMessageData {
  queue: string;
  position?: number;
  delta?: number;
  operator?: string;
  code?: number;
};

const messages = {
  processing: (u, d: IMessageData) => `<b>${d.queue}</b>\n\nВаша заявка вже оброблюється оператором. Можете заходити до корпусу.\n\n<b>Номер вашого оператору: ${d.operator ?? '0'}\nВаш номер: ${d.code}</b>`,
  moved: (u, d: IMessageData) => `<b>${d.queue}</b>\n\nВашу заявку посунули у черзі на ${d.delta} позицій ${d.delta > 0 ? 'назад' : 'вперед'}.`,
  position: (u, d: IMessageData) => `<b>${d.queue}</b>\n\nВаша позиція у черзі: <b>${d.position}</b>\nНе відходьте далеко від корпусу.`,
  deleted: (u, d: IMessageData) => `<b>${d.queue}</b>\n\nДякую за користування нашою електронною чергою.`,
};

@Entity("users")
class User extends ExtendedEntity {
  @PrimaryColumn()
  public id: string;

  @Column({ nullable: true })
  public username: string;

  @Column({ name: 'first_name', nullable: true })
  public firstName: string;

  @Column({ name: 'last_name', nullable: true })
  public lastName: string;

  @Column({ default: true })
  public telegram: boolean;

  @Column({ type: 'simple-json', default: '{}' })
  public details: any;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @OneToMany(type => QueuePosition, position => position.user, { lazy: true })
  public queuePositions: Promise<QueuePosition[]>;

  public async sendMessage(type: 'processing' | 'position' | 'moved' | 'deleted', data: IMessageData) {
    if (!this.telegram) { return; }

    const text = await messages[type](this, data);
    sendMessage(this.id, text, 'HTML');
  }

  public dto() {
    return this.pick('id', 'username', 'firstName', 'lastName', 'telegram', 'details', 'createdAt', 'updatedAt');
  }
}

export { User };