import { validationResult } from "express-validator";
import { ServiceException } from "../core/exception";

export default () => (req, _, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) { return next(); }  

  const message = errors.array().map(e => `${e.msg} in '${e.param}' - ${e.value}`).join('\n');
  next(ServiceException.build(400, 'Неправильний запит', message));
};