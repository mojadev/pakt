import { program } from "commander";

program
  .command("generate-models")
  .description("Generate or regenerate models from the OpenAPI 3+ spec")
  .action(() => console.log("Generate"));
