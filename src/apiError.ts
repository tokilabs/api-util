export class ApiError {
  /**
   * Original HTTP error code, should be consistent with the response HTTP code
   */
  public statusCode: number;

  /**
   * Classification of the error type, lower case with underscore eg validation_failure
   * @pattern [a-z]+[a-z_]*[a-z]+
   */
  public type: string;

  /**
   * A message that can be passed on to the app user, if needed
   */
  public message: string;

  /**
   * A verbose, plain language description of the error with hints on how to fix it
   */
  public developerMessage: string;

  /**
   * Link to documentation to investigate further and finding support
   */
  public moreInfo: string;

  /**
   * More details about the error
   */
  public details: any;

  public stack: string;

  constructor(err: Error, status = 500) {
    this.statusCode = status;
    this.message = err.message;
    this.developerMessage = err.message;
    this.details = err;
    this.stack = (<any>err).stack;
  }
}

export default ApiError;