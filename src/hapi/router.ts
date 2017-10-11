import { Server } from 'hapi';
import { inject, multiInject } from 'inversify';

import { IController } from '../interfaces';
import { EndpointMetadata } from '../metadata/endpoint';
import { injectable } from 'inversify';

@injectable()
export class Router {
  @inject('ApiPrefix')
  public prefix = '';

  private controllers: IController[];

  constructor(
    @inject('Server') private server: Server,
    @multiInject('IController') controllers: IController[]) {
      this.addControllers(controllers);
  }

  /**
   * Registers endpoints for the current controllers
   *
   * @memberof Router
   */
  public addControllers(ctrls: IController[]): void {
    this.controllers = this.controllers.concat(this.controllers, ctrls);

    ctrls.forEach(c => this.addController(c));
  }

  public addController(ctrl: IController) {
    const edpts: { [func: string]: any[] } = Reflect.getMetadata('methodMetadata', Object.getPrototypeOf(ctrl).constructor);

    Object.keys(edpts).forEach(func => {
      for (const meta of edpts[func]) {
        if (meta instanceof EndpointMetadata) {
          this.registerEndpoint(ctrl, func, meta);

          return;
        }
      }
    });
  }

  private registerEndpoint(ctrl: IController, func: string, meta: EndpointMetadata) {
    const path = (this.prefix + meta.path).trim().length === 0 ? '/' : (this.prefix + meta.path);

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
          validate: meta.validate
        }
      }
    );
  }
}

export default Router;
