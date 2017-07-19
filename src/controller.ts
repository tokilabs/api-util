import { injectable } from 'inversify';
import { IController } from './interfaces';

@injectable()
export class Controller implements IController {
}

export default Controller;