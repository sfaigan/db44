import { Request, Response } from 'express';

export class MiscController {
  /**
   * Renders the home page
   *
   * @class MiscController
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async index(req: Request, res: Response) {
    const options: {} = {
      title: 'Welcome to db44!',
    };

    res.render('misc/index', options);
  }
}
