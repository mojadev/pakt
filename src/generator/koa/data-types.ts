import { CodeGenerator } from "../code-generator";
import { codeGenerator } from "../code-generator.decorator";
import { Writer } from "../writer";
import { TypeScriptGeneric, TypeScriptTypeAlias } from "../../model/generated-code-model";

/**
 * Data types that are used for glueing koa and our implementation.
 *
 * TODO: This doesn't use the object graph for now, as functions, generics and classes are missing.
 */
@codeGenerator("api-types")
export class DataTypeGenerator implements CodeGenerator<object> {
  generate(_: object, writer: Writer): Writer {
    writer
      .writeLine(
        `export type GeneralResponse<
  TResponseCandidates,
  TStatusCode extends keyof TResponseCandidates
> = TStatusCode extends number
  ? TResponseCandidates[TStatusCode] extends never
    ? { status: TStatusCode }
    : { status: TStatusCode; body: TResponseCandidates[TStatusCode] }
  : never;
      `
      )
      .writeLine(
        "export type Response<TResponse extends {[key: number]: object}> = GeneralResponse<TResponse, keyof TResponse>;"
      )
      .writeLine("export type ApiOperation<TResponse extends { [status: number]: unknown }> = ")
      .inlineBlock(() => writer.write("response: TResponse;"))
      .write(";")
      .blankLine()
      .writeLine("type StringKeyedMap = Record<string, unknown>;")
      .blankLine()
      .writeLine("export interface Headers<Type extends StringKeyedMap> ")
      .inlineBlock(() => writer.writeLine("header: Type;"))

      .writeLine("export interface PathParams<Type extends StringKeyedMap> ")
      .inlineBlock(() => writer.writeLine("path: Type;"))

      .writeLine("export interface QueryParams<Type extends StringKeyedMap> ")
      .inlineBlock(() => writer.writeLine("query: Type;"))

      .writeLine("export interface Body<Type> ")
      .inlineBlock(() => writer.writeLine("body: Type;"))
      .blankLine()
      .write(
        `
export type ApiPayload<Api> = (Api extends PathParams<infer Params> ? { path: Params } : {}) &
  (Api extends QueryParams<infer Query> ? { query: Query } : {}) &
  (Api extends Headers<infer Header> ? { header: Header } : {}) &
  (Api extends Body<infer Body> ? { body: Body } : {});`
      )
      .blankLine()
      .write(
        `
export type ImplFunction<Api> = Api extends ApiOperation<infer TResponse>
? (request: ApiPayload<Api>) => TResponse
: never;
      `
      )
      .blankLine()
      .write(`export type ApiResponse<Api> = Api extends ApiOperation<infer Response> ? Response : void;`);
    return writer;
  }
}
