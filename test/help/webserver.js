import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import http2 from 'node:http2';
import connect from 'connect';
import serveStatic from 'serve-static';

const __dirname = dirname(fileURLToPath(import.meta.url));

let server;
let isListening = false;

function createServer(useHttp2) {
  const testdataFolder = join(__dirname, '..');
  const app = connect();

  app.use(serveStatic(resolve(testdataFolder, 'http-server'), {}));

  if (useHttp2) {
    const certsFolder = join(testdataFolder, 'testdata', 'certs');
    const httpsOptions = {
      key: readFileSync(join(certsFolder, 'server.key'), 'utf8'),
      cert: readFileSync(join(certsFolder, 'server.crt'), 'utf8'),
      passphrase: 'coach'
    };

    return http2.createServer(httpsOptions, app);
  } else {
    return http.createServer(app);
  }
}

export async function startServer(useHttp2) {
  if (!server) {
    server = createServer(useHttp2);
  }

  if (!isListening) {
    await new Promise((resolveCb, rejectCb) => {
      server
        .listen(0, '0.0.0.0')
        .on('error', rejectCb)
        .on('listening', () => {
          isListening = true;
          resolveCb(server.address());
        });
    });
  }

  return server.address();
}

export async function stopServer() {
  if (server && isListening) {
    await Promise.resolve(server.close());
    server = undefined;
    isListening = false;
  }
}
