import * as path from 'path';
import * as fs from 'fs';
import * as Hapi from 'hapi';
import * as mkdirp from 'mkdirp';

/**
 * Represents a log file and can be used to append info to the same request log
 *
 * @export
 * @class LogFile

 */
export class LogFile {
  private data: any;

  constructor(private logger: Logger, private path: string) {
    this.data = { events: [] };
  }

  public logEvent(type: string, data: any) {
    this.data.events.push({ type, data });
    fs.writeFile(this.path, JSON.stringify(this.data, null, 4));
  }

  public logRequest(req: Hapi.Request): Hapi.Request {
    const data = {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      payload: req.payload,
      headers: req.headers
    };

    this.logEvent('request', data);

    return req;
  }

  public logError<T>(e: T): T {
    this.logEvent('error', e);
    return e;
  }

  public logResponse(res: Hapi.Response, content: any): Hapi.Response {
    const data = {
      statusCode: res.statusCode,
      variety: res.variety,
      isBoom: res.isBoom,
      headers: res.headers,
      content: content
    };

    this.logEvent('response', data);
    return res;
  }
}

/**
 * A JSON file logger.
 *
 * Usage:
 *    const logger = new Logger('logs/root');
 *    const reqLog = logger.logRequest(req, 'endpointName'); // endpointName will become a folder
 *    // if you want to log response to the same file...
 *    return reLog.logResponse(reply('Hello world'))
 *
 * @export
 * @class Logger

 */
export class Logger {
  constructor(public logsRoot: string, public mode = '0777', public fileNamer?: (req: Hapi.Request, context: string) => string) {
    mkdirp.sync(logsRoot, { mode: '0777' });
    this.fileNamer = fileNamer || this._fileNamer;
  }

  private _fileNamer(req: Hapi.Request, context?: string): string {
    if (context) {
      mkdirp.sync(path.join(this.logsRoot, context), { mode: '0777' });
      return path.join(context, `${new Date().toISOString()}.json`);
    }

    return `${new Date().toISOString()}.txt`;
  }

  /**
   * Logs a request event and returns a LogFile instance
   *
   * @param {Hapi.Request} req
   * @param {string} [context]
   *
   * @memberOf Logger
   */
  public logRequest(req: Hapi.Request, context?: string): LogFile {
    const file = path.join(this.logsRoot, this._fileNamer(req, context));
    const log = new LogFile(this, file);
    log.logRequest(req);
    return log;
  }
}
