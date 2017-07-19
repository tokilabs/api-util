import * as inversify from 'inversify';
import * as IBD from 'inversify-binding-decorators';
import interfaces from 'inversify-binding-decorators/dts/interfaces/interfaces';

declare module 'inversify-binding-decorators' {
  namespace interfaces {
    export interface ProvideInWhenOnSyntax<T> {
      done(): (target: any) => any;
    }
  }
}

export type IProvide = (
      identifier: string | symbol | inversify.interfaces.Newable<any>,
      callback?: (provider: interfaces.ProvideInWhenOnSyntax<any>) => void)
      => (target: any) => any;

export type IFluentProvide = (identifier: string | symbol | inversify.interfaces.Newable<any>) => interfaces.ProvideInWhenOnSyntax<any>;

let _provide: IProvide;
let _fluentProvide: IFluentProvide;


let _oldOnActivation: any = null;

function fluentProvide(identifier: string | symbol | inversify.interfaces.Newable<any>): interfaces.ProvideInWhenOnSyntax<any>  {
  let provider = _fluentProvide(identifier);
  (<any>provider).activationSteps = [] as Array<(context: any, target: any) => any>;

  if (!_oldOnActivation) {
    let proto = Object.getPrototypeOf(provider);

    proto._oldOnActivation = proto.onActivation;
    proto.onActivation = function( callback: (context: inversify.interfaces.Context, target: any) => any ) {
      this.activationSteps = this.activationSteps || [];
      this.activationSteps.push(callback);
    };
    proto._oldOnActivation.apply(provider, function(ctx: inversify.interfaces.Context, target: any): any {
      console.log(this);
      this.activationSteps.forEach((step: (ctx: inversify.interfaces.Context, target: any) => any) => step(ctx, target) );
      return target;
    });

    proto.bindOptionalProp = function(property: string, identifier: string | Symbol | inversify.interfaces.Newable<any>) {
      return this.onActivation((context: any, target: any) => {
        if (context.kernel.isBound(identifier)) {
          target[property] = context.kernel.get(identifier);
        }

        return target;
      });
    };
  }

  return provider;
}


function provide(identifier: string | symbol | inversify.interfaces.Newable<any>, callback?: (provider: interfaces.ProvideInWhenOnSyntax<any>) => void): (target: any) => any {
  if (!callback)
    return _provide(identifier);

  let provider = fluentProvide(identifier);
  callback(provider);
  return provider.done();
}

export function makeProvideDecorator(container: inversify.interfaces.Container): IProvide {
  if (!_fluentProvide) _fluentProvide = IBD.makeFluentProvideDecorator(container);
  if (!_provide) _provide = IBD.makeProvideDecorator(container);
  return provide;
}

export function makeFluentProvideDecorator(container: inversify.interfaces.Container): IFluentProvide {
  if (!_fluentProvide) _fluentProvide = IBD.makeFluentProvideDecorator(container);
  return fluentProvide;
}
