import * as _ApiTypes from "./api-types";
import Router from "koa-router";
import {
  FindPetsByStatusQueryParameterSchema,
  FindPetsByTagsQueryParameterSchema,
  GetPetByIdPathParameterSchema,
  UpdatePetWithFormPathParameterSchema,
  DeletePetPathParameterSchema,
  UploadFilePathParameterSchema,
  GetOrderByIdPathParameterSchema,
  DeleteOrderPathParameterSchema,
} from "./components/parse-schemas";

import { Order, ApiResponse, Pet } from "./components/schemas";
export type ApiDefinition = {
  updatePet: {
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
        404: never;
        405: never;
      }>
    >;
  };
  addPet: {
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        405: never;
      }>
    >;
  };
  findPetsByStatus: {
    "application/xml": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Array<Pet>;
      }>
    > &
      _ApiTypes.QueryParams<{
        status: string[];
      }>;
    "application/json": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Array<Pet>;
      }>
    > &
      _ApiTypes.QueryParams<{
        status: string[];
      }>;
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
      }>
    > &
      _ApiTypes.QueryParams<{
        status: string[];
      }>;
  };
  findPetsByTags: {
    "application/xml": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Array<Pet>;
      }>
    > &
      _ApiTypes.QueryParams<{
        tags: string[];
      }>;
    "application/json": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Array<Pet>;
      }>
    > &
      _ApiTypes.QueryParams<{
        tags: string[];
      }>;
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
      }>
    > &
      _ApiTypes.QueryParams<{
        tags: string[];
      }>;
  };
  getPetById: {
    "application/xml": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Pet;
      }>
    > &
      _ApiTypes.PathParams<{
        petId: number;
      }>;
    "application/json": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Pet;
      }>
    > &
      _ApiTypes.PathParams<{
        petId: number;
      }>;
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
        404: never;
      }>
    > &
      _ApiTypes.PathParams<{
        petId: number;
      }>;
  };
  updatePetWithForm: {
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        405: never;
      }>
    > &
      _ApiTypes.PathParams<{
        petId: number;
      }>;
  };
  deletePet: {
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
        404: never;
      }>
    > &
      _ApiTypes.PathParams<{
        petId: number;
      }>;
  };
  uploadFile: {
    "application/json": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: ApiResponse;
      }>
    > &
      _ApiTypes.PathParams<{
        petId: number;
      }>;
  };
  getInventory: {
    "application/json": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: {};
      }>
    >;
  };
  placeOrder: {
    "application/xml": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Order;
      }>
    >;
    "application/json": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Order;
      }>
    >;
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
      }>
    >;
  };
  getOrderById: {
    "application/xml": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Order;
      }>
    > &
      _ApiTypes.PathParams<{
        orderId: number;
      }>;
    "application/json": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        200: Order;
      }>
    > &
      _ApiTypes.PathParams<{
        orderId: number;
      }>;
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
        404: never;
      }>
    > &
      _ApiTypes.PathParams<{
        orderId: number;
      }>;
  };
  deleteOrder: {
    "*/*": _ApiTypes.ApiOperation<
      _ApiTypes.Response<{
        400: never;
        404: never;
      }>
    > &
      _ApiTypes.PathParams<{
        orderId: number;
      }>;
  };
};

const createRegistry = <O extends keyof ApiDefinition, M extends keyof ApiDefinition[O]>() => {
  const registry = {
    updatePet: {
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["updatePet"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["updatePet"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    addPet: {
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["addPet"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["addPet"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    findPetsByStatus: {
      "application/xml": (
        params: _ApiTypes.ApiPayload<ApiDefinition["findPetsByStatus"]["application/xml"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["findPetsByStatus"]["application/xml"]> => {
        throw new Error("not implemented");
      },
      "application/json": (
        params: _ApiTypes.ApiPayload<ApiDefinition["findPetsByStatus"]["application/json"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["findPetsByStatus"]["application/json"]> => {
        throw new Error("not implemented");
      },
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["findPetsByStatus"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["findPetsByStatus"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    findPetsByTags: {
      "application/xml": (
        params: _ApiTypes.ApiPayload<ApiDefinition["findPetsByTags"]["application/xml"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["findPetsByTags"]["application/xml"]> => {
        throw new Error("not implemented");
      },
      "application/json": (
        params: _ApiTypes.ApiPayload<ApiDefinition["findPetsByTags"]["application/json"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["findPetsByTags"]["application/json"]> => {
        throw new Error("not implemented");
      },
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["findPetsByTags"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["findPetsByTags"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    getPetById: {
      "application/xml": (
        params: _ApiTypes.ApiPayload<ApiDefinition["getPetById"]["application/xml"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["getPetById"]["application/xml"]> => {
        throw new Error("not implemented");
      },
      "application/json": (
        params: _ApiTypes.ApiPayload<ApiDefinition["getPetById"]["application/json"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["getPetById"]["application/json"]> => {
        throw new Error("not implemented");
      },
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["getPetById"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["getPetById"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    updatePetWithForm: {
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["updatePetWithForm"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["updatePetWithForm"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    deletePet: {
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["deletePet"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["deletePet"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    uploadFile: {
      "application/json": (
        params: _ApiTypes.ApiPayload<ApiDefinition["uploadFile"]["application/json"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["uploadFile"]["application/json"]> => {
        throw new Error("not implemented");
      },
    },
    getInventory: {
      "application/json": (
        params: _ApiTypes.ApiPayload<ApiDefinition["getInventory"]["application/json"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["getInventory"]["application/json"]> => {
        throw new Error("not implemented");
      },
    },
    placeOrder: {
      "application/xml": (
        params: _ApiTypes.ApiPayload<ApiDefinition["placeOrder"]["application/xml"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["placeOrder"]["application/xml"]> => {
        throw new Error("not implemented");
      },
      "application/json": (
        params: _ApiTypes.ApiPayload<ApiDefinition["placeOrder"]["application/json"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["placeOrder"]["application/json"]> => {
        throw new Error("not implemented");
      },
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["placeOrder"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["placeOrder"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    getOrderById: {
      "application/xml": (
        params: _ApiTypes.ApiPayload<ApiDefinition["getOrderById"]["application/xml"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["getOrderById"]["application/xml"]> => {
        throw new Error("not implemented");
      },
      "application/json": (
        params: _ApiTypes.ApiPayload<ApiDefinition["getOrderById"]["application/json"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["getOrderById"]["application/json"]> => {
        throw new Error("not implemented");
      },
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["getOrderById"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["getOrderById"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
    deleteOrder: {
      "*/*": (
        params: _ApiTypes.ApiPayload<ApiDefinition["deleteOrder"]["*/*"]>
      ): _ApiTypes.ApiResponse<ApiDefinition["deleteOrder"]["*/*"]> => {
        throw new Error("not implemented");
      },
    },
  };

  return {
    register<
      Operation extends keyof typeof registry & keyof ApiDefinition,
      MimeType extends keyof typeof registry[Operation] & keyof ApiDefinition[Operation]
    >(
      operation: Operation,
      mimeType: MimeType,
      request: (
        args: _ApiTypes.ApiPayload<ApiDefinition[Operation][MimeType]>
      ) => _ApiTypes.ApiResponse<ApiDefinition[Operation][MimeType]>
    ) {
      registry[operation] = registry[operation] || {};
      registry[operation][mimeType] = request as unknown as typeof registry[Operation][MimeType];
    },
    get() {
      return registry;
    },
  };
};

export const registry = createRegistry();
export const router = new Router();
router.put("/pet", (ctx, next) => {
  const mimeType = ctx.accepts(["*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "*/*":
      result = registry.get()["updatePet"]["*/*"]({});
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.post("/pet", (ctx, next) => {
  const mimeType = ctx.accepts(["*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "*/*":
      result = registry.get()["addPet"]["*/*"]({});
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.get("/pet/findByStatus", (ctx, next) => {
  const mimeType = ctx.accepts(["application/xml", "application/json", "*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const queryParams = FindPetsByStatusQueryParameterSchema.parse(ctx.query);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "application/xml":
      result = registry.get()["findPetsByStatus"]["application/xml"]({
        query: queryParams,
      });
    case "application/json":
      result = registry.get()["findPetsByStatus"]["application/json"]({
        query: queryParams,
      });
    case "*/*":
      result = registry.get()["findPetsByStatus"]["*/*"]({
        query: queryParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.get("/pet/findByTags", (ctx, next) => {
  const mimeType = ctx.accepts(["application/xml", "application/json", "*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const queryParams = FindPetsByTagsQueryParameterSchema.parse(ctx.query);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "application/xml":
      result = registry.get()["findPetsByTags"]["application/xml"]({
        query: queryParams,
      });
    case "application/json":
      result = registry.get()["findPetsByTags"]["application/json"]({
        query: queryParams,
      });
    case "*/*":
      result = registry.get()["findPetsByTags"]["*/*"]({
        query: queryParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.get("/pet/:petId", (ctx, next) => {
  const mimeType = ctx.accepts(["application/xml", "application/json", "*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const pathParams = GetPetByIdPathParameterSchema.parse(ctx.params);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "application/xml":
      result = registry.get()["getPetById"]["application/xml"]({
        path: pathParams,
      });
    case "application/json":
      result = registry.get()["getPetById"]["application/json"]({
        path: pathParams,
      });
    case "*/*":
      result = registry.get()["getPetById"]["*/*"]({
        path: pathParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.post("/pet/:petId", (ctx, next) => {
  const mimeType = ctx.accepts(["*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const pathParams = UpdatePetWithFormPathParameterSchema.parse(ctx.params);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "*/*":
      result = registry.get()["updatePetWithForm"]["*/*"]({
        path: pathParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.delete("/pet/:petId", (ctx, next) => {
  const mimeType = ctx.accepts(["*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const pathParams = DeletePetPathParameterSchema.parse(ctx.params);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "*/*":
      result = registry.get()["deletePet"]["*/*"]({
        path: pathParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.post("/pet/:petId/uploadImage", (ctx, next) => {
  const mimeType = ctx.accepts(["application/json"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const pathParams = UploadFilePathParameterSchema.parse(ctx.params);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "application/json":
      result = registry.get()["uploadFile"]["application/json"]({
        path: pathParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.get("/store/inventory", (ctx, next) => {
  const mimeType = ctx.accepts(["application/json"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "application/json":
      result = registry.get()["getInventory"]["application/json"]({});
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.post("/store/order", (ctx, next) => {
  const mimeType = ctx.accepts(["application/xml", "application/json", "*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "application/xml":
      result = registry.get()["placeOrder"]["application/xml"]({});
    case "application/json":
      result = registry.get()["placeOrder"]["application/json"]({});
    case "*/*":
      result = registry.get()["placeOrder"]["*/*"]({});
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.get("/store/order/:orderId", (ctx, next) => {
  const mimeType = ctx.accepts(["application/xml", "application/json", "*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const pathParams = GetOrderByIdPathParameterSchema.parse(ctx.params);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "application/xml":
      result = registry.get()["getOrderById"]["application/xml"]({
        path: pathParams,
      });
    case "application/json":
      result = registry.get()["getOrderById"]["application/json"]({
        path: pathParams,
      });
    case "*/*":
      result = registry.get()["getOrderById"]["*/*"]({
        path: pathParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});

router.delete("/store/order/:orderId", (ctx, next) => {
  const mimeType = ctx.accepts(["*/*"]);
  if (!mimeType) {
    ctx.response.status = 406;
    ctx.response.body = "";
    return;
  }

  const pathParams = DeleteOrderPathParameterSchema.parse(ctx.params);

  let result: { body?: unknown; headers?: Record<string, string>; status?: number } = {};
  switch (mimeType) {
    case "*/*":
      result = registry.get()["deleteOrder"]["*/*"]({
        path: pathParams,
      });
  }

  ctx.body = result.body;
  ctx.set(result.headers || {});
  ctx.status = result.status || 404;
});
