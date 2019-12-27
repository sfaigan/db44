import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import * as errorHandler from 'errorhandler';
import * as session from 'express-session';
import * as dotenv from 'dotenv';
import { Order } from './models/Order';
const flash = require('connect-flash');
const methodOverride = require('method-override');

interface Error {
  status?: number;
  message?: string;
}

/**
 * The express app.
 *
 * @class App
 */
class App {
  app: express.Application;
  port: number | string;

  /**
   * Constructor.
   *
   * @class App
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();
    this.port = this.normalizePort(process.env.PORT || '3000');

    //configure application
    this.config();
    //add routes
    this.routes();

    dotenv.config();
  }

  /**
   * Configure application
   *
   * @class App
   * @method config
   */
  config() {
    this.app.set('port', this.port);

    this.app.use(methodOverride('_method'));

    //add static paths
    this.app.use('/public', express.static(path.join(__dirname, '../public')));

    //configure pug
    this.app.set('views', path.join(__dirname, '../views'));
    this.app.set('view engine', 'pug');

    //mount logger
    this.app.use(logger('dev'));

    //mount query string parser
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(bodyParser.json());

    //mount cookie parser middleware
    this.app.use(
      session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 21600000 },
      })
    );
    this.app.use(flash());

    // App locals (global variables)
    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        res.locals.session = req!.session; // User session
        res.locals.success_messages = req.flash('success_messages');
        res.locals.error_messages = req.flash('error_messages');
        if (this.app.locals.numItemsInCart === undefined) {
          const user = res.locals.session.user;
          this.app.locals.numItemsInCart = user
            ? Order.getNumberOfItemsInCartFromUserId(user._id)
            : 0;
        }
        next();
      }
    );

    // catch 404 and forward to error handler
    this.app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        err.status = 404;
        next(err);
      }
    );

    //error handling
    this.app.use(errorHandler());
  }

  /**
   * Create and return Router.
   *
   * @class App
   * @method routes
   * @return void
   */
  private routes() {
    this.app.use('/', require('./routes/MiscRoutes'));
    this.app.use('/users', require('./routes/UserRoutes'));
    this.app.use('/session', require('./routes/SessionRoutes'));
    this.app.use('/store', require('./routes/StoreRoutes'));
    this.app.use('/products', require('./routes/ProductRoutes'));
    this.app.use('/orders', require('./routes/OrderRoutes'));
    this.app.use('/checkout', require('./routes/CheckoutRoutes'));
    this.app.use('/cart', require('./routes/CartRoutes'));
    this.app.use('/suppliers', require('./routes/SupplierRoutes'));
  }

  private normalizePort(val: string | number) {
    const port = +val;

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    return port;
  }
}

export = new App();
