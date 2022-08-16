import { Entity, Column, PrimaryColumn } from "typeorm";
import { ExtendedEntity } from "./ExtendedEntity";

export enum RoleType {
  RECEPTION = 'reception',
  OPERATOR = 'operator',
  ADMIN = 'admin',
};

const weight = {
  reception: 0,
  operator: 10,
  admin: 100,
};

@Entity("roles")
export class Role extends ExtendedEntity {
  @PrimaryColumn()
  public username: string;

  @Column()
  public password: string;

  @Column()
  public type: RoleType;

  public hasAccess(type: RoleType) {
    return weight[this.type] >= weight[this.type];
  }

  public dto() {
    return this.pick('username', 'type');
  }
};
