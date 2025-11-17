export interface ServiceResponse<T> {
  data: T;
  isSuccess: boolean;
  errorMessage: string;
}
