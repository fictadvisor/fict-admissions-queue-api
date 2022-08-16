import { IRequest } from "../core/api";
import { ServiceException } from "../core/exception";
import { getCachedRole } from "../services/role";
import { Role } from "../db/entities/Role";

export interface IAuthorization {
  operator: string;
  role: Role;
};

export default () => (req: IRequest, res, next) => {
  const [type, token, operator] = (req.headers.authorization ?? '').split(' ');

  const role = getCachedRole(token);

  if (!role) {
    return next(ServiceException.build(401, 'Облікові дані невірні'));
  }

  req.authorization = {
    operator: operator ?? '0',
    role,
  };

  next();
};