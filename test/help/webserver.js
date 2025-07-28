'use strict';

const Promise = require('bluebird');
const fs = require('fs');
const connect = require('connect');
const serveStatic = require('serve-static');
const http = require('http');
const http2 = require('http2');
const path = require('path');

Promise.promisifyAll(fs);

let server;
let isListening = false;

function createServer(useHttp2) {
  const testdataFolder = path.join(__dirname, '..');
  const app = connect();

  app.use(serveStatic(path.resolve(testdataFolder, 'http-server'), {}));

  if (useHttp2) {
    const certsFolder = path.join(testdataFolder, 'testdata', 'certs');
    const httpsOptions = {
      key: fs.readFileSync(path.join(certsFolder, 'server.key'), 'utf8'),
      cert: fs.readFileSync(path.join(certsFolder, 'server.crt'), 'utf8'),
      passphrase: 'coach'
    };

    return http2.createServer(httpsOptions, app);
  } else {
    return http.createServer(app);
  }
}

module.exports = {
  async startServer(useHttp2) {
    if (!server) {
      server = createServer(useHttp2);
    }

    if (!isListening) {
      await new Promise((resolve, reject) => {
        server
          .listen(0, '0.0.0.0')
          .on('error', reject)
          .on('listening', () => {
            isListening = true;
            resolve(server.address());
          });
      });
    }

    return server.address();
  },

  async stopServer() {
    if (server && isListening) {
      await Promise.resolve(server.close());
      server = undefined;
      isListening = false;
    }
  }
};
