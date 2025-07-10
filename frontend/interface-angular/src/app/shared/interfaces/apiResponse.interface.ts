export interface iApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}