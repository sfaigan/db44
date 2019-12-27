import { Request, Response } from 'express';
import { User, UserI } from '../models/User';
import { ValidationError } from '../Validator';
import { ObjectId } from 'mongodb';

export class UsersController {
  /**
   * Renders a table of all the users
   *
   * @class UsersController
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async index(req: Request, res: Response) {
    try {
      const users = await User.findAll();
      const options = {
        title: 'Users List',
        users,
      };

      res.render('users/index', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Renders a single user's details
   *
   * @class UsersController
   * @method show
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async show(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      const options = {
        title: 'User Details',
        user,
      };

      res.render('users/show', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Renders the new user (register) view
   *
   * @class UsersController
   * @method new
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async new(req: Request, res: Response) {
    const options: {} = {
      title: 'Registration',
      message: 'Register a new account',
    };

    res.render('users/register', options);
  }

  /**
   * Creates a new user
   *
   * @class UsersController
   * @method create
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/'
   */
  async create(req: Request, res: Response) {
    let role = 'customer';
    let supplierId: null | ObjectId = null;
    if (req!.body.inputSupplier === 'on') {
      role = 'supplier';
      supplierId = new ObjectId(req.body.supplierId);
    }
    const data = {
      email: req.body.email,
      password: req.body.password,
      role,
      supplierId,
    };

    if (req.body.password !== req.body.confirm_password) {
      req.flash('error_messages', 'Passwords do not match. Please try again.');
      return res.redirect('/users/register');
    }
    try {
      await User.create(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }

      return res.redirect('/users/register');
    }
    req.flash('success_messages', 'Account successfully created!');

    return res.redirect('/session/login');
  }

  /**
   * Renders the edit page for a user
   *
   * @class UsersController
   * @method edit
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async edit(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      let supplierCB;
      user.role === 'supplier' ? (supplierCB = true) : (supplierCB = false);

      const options = {
        title: 'Users List',
        user,
        supplierCB,
      };
      return res.render('users/edit', options);
    } catch (error) {
      return res.redirect('/users');
    }
  }

  /**
   * Updates a user's details
   *
   * @class UsersController
   * @method update
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/users/:_id'
   */
  async update(req: Request, res: Response) {
    const data: Partial<UserI> = {};
    // Add properties if the values are defined in the update data
    if (req.body.email) data.email = req.body.email;
    if (req.body.inputSupplier) {
      data.role = req.body.inputSupplier === 'on' ? 'supplier' : 'customer';
    }

    try {
      const user = await User.findById(req.params.id);
      await user.update(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/users/edit/' + req.params.id);
    }

    return res.redirect('/users/' + req.params.id);
  }

  /**
   * Deletes a user
   *
   * @class UsersController
   * @method delete
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/users/:_id'
   */
  async delete(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      await user.delete();
    } catch (error) {}
    return res.redirect('/users');
  }
}
