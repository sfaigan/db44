import * as http from 'http';
import * as dotenv from 'dotenv';

const app = require('./app');
const dbClient = require('./DbClient');
dotenv.config();

/**
 * The server.
 *
 * @class Server
 */
class Server {
  /**
   * Constructor.
   *
   * @class App
   * @constructor
   */
  constructor() {
    const server = http.createServer(app.app);
    server.listen(app.port);
    server.on('error', this.onError);
    server.on('listening', this.onListening);
  }

  private onError(error: any) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind =
      typeof app.port === 'string' ? 'Pipe ' + app.port : 'Port ' + app.port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
      default:
        throw error;
    }
  }
  private async onListening() {
    await dbClient.connect(process.env.NODE_ENV || 'development');
  }
}

export = new Server();
