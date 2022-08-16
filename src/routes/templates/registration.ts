import { Route, RequestMethod } from "../../core/api";
import { tokens } from "../../core/registration";

/** GET /templates/registration */
export class Get extends Route {
  url = '/templates/registration';
  method = RequestMethod.GET;

  async onRequest() {
    return {
      template: {
        tokens,
      },
    };
  }
};
