import * as Joi from 'joi';
import { MethodDecorator, makeMethodDecorator } from './decorators';

/**
 * Interface for creating {@link EndpointMetadataType}
 * @experimental
 */
export interface EndpointMetadataOptions {
  description?: string;
  notes?: string;
  tags?: string[];
  handler?: string | ( (req: any, reply: any) => any);
  validate?: { query?: any; params?: any; payload?: any; };
  response?: { schema: any; };
}

export interface EndpointDecorator extends MethodDecorator {}

/**
 * Declare reusable UI building blocks for an application.
 *
 * Each Angular Endpoint requires a single `@Endpoint` annotation. The
 * `@Endpoint`
 * annotation specifies when a Endpoint is instantiated, and which properties and hostListeners it
 * binds to.
 *
 * When a Endpoint is instantiated, Angular
 * - creates a shadow DOM for the Endpoint.
 * - loads the selected template into the shadow DOM.
 * - creates all the injectable objects configured with `providers` and `viewProviders`.
 *
 * All template expressions and statements are then evaluated against the Endpoint instance.
 *
 * ## Lifecycle hooks
 *
 * When the Endpoint class implements some {@linkDocs guide/lifecycle-hooks} the
 * callbacks are called by the change detection at defined points in time during the life of the
 * Endpoint.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='Endpoint'}
 * @stable
 */
export class EndpointMetadata implements EndpointMetadataOptions {
  public method: string;
  public path: string;
  public description: string;
  public notes: string;
  public tags: string[];
  public validate: { query?: any; params?: any; payload?: any; };
  public response: { schema: any };

  constructor(method: string, path: string, {description, notes, tags, validate, response}: EndpointMetadataOptions = {}) {
    this.method = method;
    this.path = path;
    this.description = description;
    this.notes = notes;
    this.tags = tags;
    this.validate = validate;
    this.response = response;
  }
}

/**
 * {@link EndpointMetadata} factory for creating annotations, decorators or DSL.
 *
 * ### Example as TypeScript Decorator
 *
 * {@example core/ts/metadata/metadata.ts region='Endpoint'}
 *
 * ### Example as ES5 DSL
 *
 * ```
 * var MyEndpoint = ng
 *   .Endpoint({...})
 *   .Class({
 *     constructor: function() {
 *       ...
 *     }
 *   })
 * ```
 *
 * ### Example as ES5 annotation
 *
 * ```
 * var MyEndpoint = function() {
 *   ...
 * };
 *
 * MyEndpoint.annotations = [
 *   new ng.Endpoint({...})
 * ]
 * ```
 *
 * @stable
 */
export interface EndpointMetadataFactory {
  (method: string, path: string, obj: EndpointMetadataOptions): any;
  new (method: string, path: string, obj: EndpointMetadataOptions): EndpointMetadata;
}

/** @stable */
export var Endpoint: EndpointMetadataFactory = <EndpointMetadataFactory>makeMethodDecorator(EndpointMetadata);
