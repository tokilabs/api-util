import { ExtendedObject } from '@cashfarm/lang';

// @todo make it extend Hapi.Request
export class Request extends ExtendedObject {

  constructor(
    protected params: any,
    protected query: any,
    protected payload: any) {
    super();
  }

  protected loadFromPayload() {
    if (this.payload) {
      Object.keys(this.payload).forEach(k => {
        this[k] = this.payload[k];
      });
    }
  }

  protected loadFromQueryString() {
    if (this.query) {
      Object.keys(this.query).forEach(k => {
        this[k] = this.query[k];
      });
    }
  }
}

export default Request;
