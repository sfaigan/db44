import { Request, Response } from 'express';
import { Supplier, SupplierI } from '../models/Supplier';
import { ValidationError } from '../Validator';

export class SuppliersController {
  /**
   * Renders a table of all the suppliers
   *
   * @class SuppliersController
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async index(req: Request, res: Response) {
    try {
      const suppliers = await Supplier.findAll();
      const options = {
        title: 'Suppliers List',
        suppliers,
      };

      res.render('suppliers/index', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Renders a single supplier's details
   *
   * @class SuppliersController
   * @method show
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async show(req: Request, res: Response) {
    try {
      const supplier = await Supplier.findById(req.params.id);
      const options = {
        title: 'Supplier Details',
        supplier,
      };

      res.render('suppliers/show', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Creates a new supplier
   * Note: Currently, there is no way to do this from the UI
   *
   * @class SuppliersController
   * @method create
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/'
   */
  async create(req: Request, res: Response) {
    const data = {
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      website: req.body.website,
    };

    try {
      await Supplier.create(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }

      return res.redirect('/suppliers/register');
    }

    return res.redirect('/suppliers');
  }

  /**
   * Renders the edit page for a supplier
   *
   * @class SuppliersController
   * @method edit
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async edit(req: Request, res: Response) {
    try {
      const supplier = await Supplier.findById(req.params.id);

      const options = {
        title: 'Suppliers List',
        supplier,
      };
      return res.render('suppliers/edit', options);
    } catch (error) {
      return res.redirect('/suppliers');
    }
  }

  /**
   * Updates a supplier's details
   *
   * @class SuppliersController
   * @method update
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/suppliers/:_id'
   */
  async update(req: Request, res: Response) {
    const data: Partial<SupplierI> = {};
    const address =
      req.body.address && typeof req.body.address === 'string'
        ? JSON.parse(req.body.address)
        : req.body.address;
    // Add properties if the values are defined in the update data
    if (req.body.name) data.name = req.body.name;
    if (req.body.address) data.address = address;
    if (req.body.phone) data.phone = req.body.phone;
    if (req.body.website) data.website = req.body.website;

    try {
      const supplier = await Supplier.findById(req.params.id);
      await supplier.update(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/suppliers/edit/' + req.params.id);
    }

    return res.redirect('/suppliers/' + req.params.id);
  }

  /**
   * Deletes a supplier
   *
   * @class SuppliersController
   * @method delete
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/suppliers/:_id'
   */
  async delete(req: Request, res: Response) {
    try {
      const supplier = await Supplier.findById(req.params.id);
      await supplier.delete();
    } catch (error) {}
    return res.redirect('/suppliers');
  }
}
