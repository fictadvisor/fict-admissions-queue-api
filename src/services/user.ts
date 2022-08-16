import { User } from "../db/entities/User";
import { ServiceException } from "../core/exception";
import { FindOneOptions } from "typeorm";

export const findUserById = async (id: string, options?: FindOneOptions<User>) => {
  const user = await User.findOne({ id }, options);
    
  if (!user) {
    throw ServiceException.build(404, 'Такого користувача не існує');
  }

  return user;
};

export const createUser = async (user: User) => {
  if (await User.findOne({ id: user.id })) {
    throw ServiceException.build(409, 'Користувач з таким ідентифікатором вже існує');
  }

  return await user.save();
};
