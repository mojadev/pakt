export type GeneralResponse<
  TResponseCandidates,
  TStatusCode extends keyof TResponseCandidates
> = TStatusCode extends number
  ? TResponseCandidates[TStatusCode] extends never
    ? { status: TStatusCode }
    : { status: TStatusCode; body: TResponseCandidates[TStatusCode] }
  : never;
      
export type Response<TResponse extends {[key: number]: object}> = GeneralResponse<TResponse, keyof TResponse>;
export type ApiOperation<TResponse extends { [status: number]: unknown }> = 
{
  response: TResponse;
};

type StringKeyedMap = Record<string, unknown>;

export interface Headers<Type extends StringKeyedMap> 
{
  header: Type;
}
export interface PathParams<Type extends StringKeyedMap> 
{
  path: Type;
}
export interface QueryParams<Type extends StringKeyedMap> 
{
  query: Type;
}
export interface Body<Type> 
{
  body: Type;
}


export type ApiPayload<Api> = (Api extends PathParams<infer Params> ? { path: Params } : {}) &
  (Api extends QueryParams<infer Query> ? { query: Query } : {}) &
  (Api extends Headers<infer Header> ? { header: Header } : {}) &
  (Api extends Body<infer Body> ? { body: Body } : {});


export type ImplFunction<Api> = Api extends ApiOperation<infer TResponse>
? (request: ApiPayload<Api>) => TResponse
: never;
      

export type ApiResponse<Api> = Api extends ApiOperation<infer Response> ? Response : void;