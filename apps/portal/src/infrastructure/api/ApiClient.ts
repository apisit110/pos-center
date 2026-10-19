import axios, { AxiosError, AxiosResponse } from 'axios';

export const API_V1 = '/api/v1';

/** Error body returned by portal-service: {res_code, res_desc, details?, additional?, request_id}. */
export interface ApiErrorBody {
  res_code?: string;
  /** error message in the language of the request header `Accept-Language` (`th` or `en`) */
  res_desc?: string;
  details?: unknown;
  additional?: string;
  request_id?: string;
  message?: string;
}

/** Language of backend error messages, sent as `Accept-Language` (`th` or `en`). */
export const DEFAULT_LANGUAGE = 'en';

const ApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': DEFAULT_LANGUAGE,
  },
  // array params are sent repeated (`brands=A&brands=B`) instead of `brands[]=A`
  paramsSerializer: { indexes: null },
});

/** Read the error message out of `res_desc` (a string in the `Accept-Language` language). */
export const getResDescMessage = (body?: ApiErrorBody): string | undefined => {
  const desc = body?.res_desc;
  return typeof desc === 'string' && desc ? desc : undefined;
};

// Surface `res_desc` through `error.message` and `error.response.data.message`,
// the places the existing error UI already reads from.
ApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const body = error.response?.data;
    if (body && typeof body === 'object') {
      const message = getResDescMessage(body);
      if (message) {
        body.message = message;
        error.message = message;
      }
    }
    return Promise.reject(error);
  },
);

/** Unwrap `data` out of the `Ok` envelope `{res_code, res_desc, data}`. */
export const unwrap = <T = unknown>(response: AxiosResponse): T => response.data?.data as T;

/** Drop undefined / null / empty-string query values. */
export const cleanParams = (params: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0),
    ),
  );

export default ApiClient;
