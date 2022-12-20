import { spawn } from 'child_process';
import getPort from 'get-port';
import path from 'path';

const DEBUG_E2E = Boolean(process.env.DEBUG_E2E);

export const runServer = async (folder: string): Promise<ServerProcess> => {
  const cwd = path.join(__dirname, '..', folder);
  const port = await getPort();
  console.info(`(start) Starting at port ${port}`, folder, cwd);
  return await new Promise<ServerProcess>((resolve, reject) => {
    const process = spawn(`yarn start ${port}`, { shell: true, cwd });
    process.stderr.addListener('error', (err) => {
      console.error(err);
      reject(err);
    });
    process.addListener('error', (err) => {
      reject(err);
    });
    process.stdout.addListener('data', (data: Buffer) => {
      const msg = data.toString('utf-8');
      if (DEBUG_E2E) {
        console.log('(server): ', data.toString('utf-8'));
      }
      if (msg.includes(`Starting at port ${port}`)) {
        resolve({
          stop() {
            console.info('Killing process');
            process.kill();
          },
          port,
        });
      }
    });
  });
};

export interface ServerProcess {
  stop: () => void;
  port: number;
}
