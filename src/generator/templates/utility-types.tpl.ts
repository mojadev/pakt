/**
 * Static utility types
 */
export const utilityTypes = (): string => {
  return `
/**
 * An implementation for a api triggered operation.
 */
type ApiOperation<TParams, TResponse> = { (params: TParams): Promise<ApiResponse<TResponse>> };


class ApiResponse<T> {
  constructor(public payload: T, public status = 200) {}
}

/**
 * Create a response with a given status code for the payload T
 */
export function responseWithStatusCode<T>(status: number): new (payload: T) => ApiResponse<T> {
  return class Response extends ApiResponse<T> {
    public status = status;
    constructor(public payload: T) {
      super(payload, status);
    }
  };
}

`;
};
