import axios from 'axios';
import { generateSource } from './steps/generate-source';
import { runServer, ServerProcess } from './steps/run-server';
import { setupProject } from './steps/setup-project';

const folder = 'echo-server';
describe('Echo server e2e test', () => {
  let server: ServerProcess;
  let baseUrl: URL;
  beforeEach(async () => {
    await setupProject(folder);
    await generateSource(folder);
    server = await runServer(folder);
    baseUrl = new URL('http://localhost');
    baseUrl.port = String(server.port);
  });

  afterEach(() => {
    server?.stop();
  });

  const getUrl = (path: string): URL => {
    const result = new URL(baseUrl);
    result.pathname = path;
    return result;
  };

  it('should run on a free port and return an echo on GET', async () => {
    const result = await axios.get(getUrl('/echo/test').toString());

    expect(result.data).toEqual({ path: [{ key: 'path', value: 'test' }], query: [] });
  });

  it('should return query parameters in the response when they have been provided on a GET request', async () => {
    const url = getUrl('/echo/test');
    url.searchParams.append('query', 'queryString');
    const result = await axios.get(url.toString());

    expect(result.data).toEqual({
      path: [{ key: 'path', value: 'test' }],
      query: [{ key: 'query', value: 'queryString' }],
    });
  });

  it('should return the request body on POST requests', async () => {
    const url = getUrl('/echo/test');

    const result = await axios.post(url.toString(), { id: '12345', name: 'a' });

    expect(result.data).toEqual({
      path: [{ key: 'path', value: 'test' }],
      body: { id: '12345', name: 'a' },
    });
  });

  it('should return a 500 (TODO: 400) on invalid enum values', async () => {
    const url = getUrl('/echo/test');

    try {
      const result = await axios.post(url.toString(), { id: '12345', name: 'invalid' });
      expect(result.status).toEqual(400);
    } catch (e) {
      expect(axios.isAxiosError(e)).toBeTruthy();
      if (axios.isAxiosError(e)) {
        expect(e.status).toEqual(undefined);
      }
    }
  });
});
