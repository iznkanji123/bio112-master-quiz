export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public data: T | null,
    public message: string,
    public status: number
  ) {}

  static success<T>(data: T, message: string = 'Success', status: number = 200): ApiResponse<T> {
    return new ApiResponse(true, data, message, status);
  }

  static error<T>(message: string, status: number = 400): ApiResponse<T> {
    return new ApiResponse(false, null, message, status);
  }
}
