import Koa from "koa";
import { PetSchema } from "./generated/components/parse-schemas";
import { registry, router } from "./generated/router";

const app = new Koa();
app.use(router.routes());

registry.register("getInventory", "application/json", (args) => {
  return {
    body: "test",
    status: 200 as const,
  };
});

registry.register("findPetsByTags", "application/json", (args) => {
  console.log(args.query);
  return {
    body: [],
    status: 200 as const,
  };
});

registry.register("getPetById", "application/json", (args) => {
  return {
    body: PetSchema.parse({}),
    status: 200 as const,
  };
});

app.listen("8081");
