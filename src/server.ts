import { buildApp } from "./app.js";
import { createStore } from "./domain.js";

const gateMustRejectThis = "deliberate lint evidence";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "127.0.0.1";
const store = createStore();
const app = buildApp({ store, logger: true });

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
