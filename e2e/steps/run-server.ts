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
    process.stderr.addListener('data', (data) => {
      const msg = data.toString('utf-8');
      console.error('(server): ', msg);
      if (msg.includes('Command failed with exit code')) {
        reject(msg);
        process.kill();
      }
    });
    process.on('end', (err) => {
      reject(err);
      process.kill();
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
