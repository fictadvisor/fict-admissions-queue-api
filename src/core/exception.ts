export class ServiceException extends Error {
  public status: number;
  public message: string;
  public details?: string;

  constructor(status: number, message: string, details?: string) {
    super();
    
    this.status = status;
    this.message = message;
    this.details = details;
  }

  public static build(status: number, message: string, details?: string) {
    return new ServiceException(status, message, details);
  }
};
