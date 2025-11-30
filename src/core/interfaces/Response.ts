export interface ServiceResponse<T> {
  data: T;
  isSuccess: boolean;
  statusCode: number;
  errorMessage: string;
}
