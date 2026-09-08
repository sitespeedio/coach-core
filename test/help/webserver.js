import { readFileSync, createReadStream, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import http2 from 'node:http2';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', 'http-server');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

let server;
let isListening = false;

function resolveRequestPath(urlPath) {
  const pathOnly = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const safe = normalize(pathOnly).replace(/^(\.\.[\\/])+/, '');
  const candidate = join(root, safe);
  if (!candidate.startsWith(root)) return null;
  return candidate;
}

function handle(req, res) {
  const target = resolveRequestPath(req.url || '/');
  if (!target) {
    res.statusCode = 403;
    res.end();
    return;
  }
  try {
    const stat = statSync(target);
    if (stat.isDirectory()) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader(
      'Content-Type',
      MIME[extname(target).toLowerCase()] || 'application/octet-stream'
    );
    res.setHeader('Content-Length', stat.size);
    createReadStream(target).pipe(res);
  } catch {
    res.statusCode = 404;
    res.end();
  }
}

function createServer(useHttp2) {
  if (useHttp2) {
    const certsFolder = join(__dirname, '..', 'testdata', 'certs');
    const httpsOptions = {
      key: readFileSync(join(certsFolder, 'server.key'), 'utf8'),
      cert: readFileSync(join(certsFolder, 'server.crt'), 'utf8'),
      passphrase: 'coach'
    };
    return http2.createServer(httpsOptions, handle);
  }
  return http.createServer(handle);
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
