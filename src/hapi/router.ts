import { Server } from 'hapi';
import { inject, multiInject } from 'inversify';

import { IController } from '../interfaces';
import { EndpointMetadata } from '../metadata/endpoint';
import { injectable } from 'inversify';

export interface IRoutesConfig {}

export interface IRouter {}

@injectable()
export class Router {

  // @todo: implement loading routes from routes config object
  @inject('ApiPrefix')
  public prefix: string = '';

  constructor(
    @inject('Server') private server: Server,
    @multiInject('IController') private controllers: IController[]) {
  }

  public registerEndpoints(): void {
    this.controllers.forEach(c => {
      let edpts: { [func: string]: any[] } = Reflect.getMetadata('methodMetadata', Object.getPrototypeOf(c).constructor);
      Object.keys(edpts).forEach(func => {
        for (let meta of edpts[func]) {
          if (meta instanceof EndpointMetadata) {
            this.registerEndpoint(c, func, meta);
            return;
          }
        }
      });
    });
  }

  private registerEndpoint(ctrl: IController, func: string, meta: EndpointMetadata) {
    let path = (this.prefix + meta.path).trim().length == 0 ? '/' : (this.prefix + meta.path);
    this.server.log('debug', `Mapping route ${path} to ${Object.getPrototypeOf(ctrl).constructor.name}.${func}`);

    this.server.route(
      {
        method: meta.method,
        path: path,
        config: {
          description: meta.description,
          notes: meta.notes,
          tags: meta.tags,
          handler: ctrl[func].bind(ctrl),
          validate: meta.validate,
        }
      }
    );
  }

  public register(server: Server, options: any, next: () => any): void {
    next();
  }
}

export default Router;