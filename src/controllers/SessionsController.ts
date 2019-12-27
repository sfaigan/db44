import { Request, Response } from 'express';
import { User } from '../models/User';

export class SessionsController {
  /**
   * Renders the login page
   *
   * @class SessionsController
   * @method new
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async new(req: Request, res: Response) {
    const options: {} = {
      title: 'Log in',
    };

    res.render('session/login', options);
  }

  /**
   * Authenticates the user based on email and password
   *
   * @class SessionsController
   * @method create
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to home page
   */
  async create(req: Request, res: Response) {
    const session = req!.session;
    const query = {
      email: req.body.email,
      password: req.body.password,
    };
    try {
      const users = await User.findAll(query);
      if (users.length === 1) {
        session!.user = users[0];
        req.flash('success_messages', 'User is authenticated');
        return res.redirect('/');
      }
    } catch (error) {}

    req.flash('error_messages', 'Email or password is incorrect');

    return res.redirect('/session/login');
  }

  /**
   * Logs a user out of the application (destroys their session)
   *
   * @class SessionsController
   * @method delete
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to home page
   */
  async delete(req: Request, res: Response) {
    const session = req!.session;

    session!.user = undefined;
    session!.message = 'Logged out';

    return res.redirect('/');
  }
}
