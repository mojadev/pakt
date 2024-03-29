import Koa from 'koa';
import { registry, router } from './router';
import { zodErrorHandler } from 'koa-zod-errorhandler';
import cors from '@koa/cors';

const port = process.argv[2] ?? 8081;
const app = new Koa();

app.use(cors());
app.use(zodErrorHandler());
app.use(router.routes());

registry.register('echoRequest', 'application/json', (args) => {
  return {
    body: {
      path: [{ key: 'path', value: args.path.path }],
      query: Object.entries(args.query).map(([key, value]) => ({ key, value })),
    },
    status: 200 as const,
  };
});

registry.register('echoPostRequest', 'application/json', async (args) => {
  return {
    body: {
      path: [{ key: 'path', value: args.path.path }],
      body: args.body,
    },
    status: 200 as const,
  };
});

console.log('Starting at port', port);
app.listen(port);
