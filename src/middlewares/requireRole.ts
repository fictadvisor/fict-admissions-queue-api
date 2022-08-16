import { RoleType } from "../db/entities/Role";
import { IRequest } from "../core/api";
import { ServiceException } from "../core/exception";

export default (type: RoleType) => (req: IRequest, res, next) => {
  if (!req.authorization || !req.authorization.role.hasAccess(type)) {
    return next(ServiceException.build(403, 'У вас немає доступу до цього'));
  }

  next();
};
