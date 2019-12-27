import { Request, Response } from 'express';
import { Product } from '../models/Product';

export class StoresController {
  /**
   * Renders the store page
   *
   * @class StoresController
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async index(req: Request, res: Response) {
    try {
      const query = await Product.buildQuery(req);
      const categories = await Product.getCategories(req.query.categories);
      const suppliers = await Product.getSuppliers(req.query.suppliers);
      const products = await Product.findAll(query);

      const options = {
        title: 'db44 | Store',
        products,
        categories,
        suppliers,
      };
      res.render('stores/index', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Renders a product's details
   *
   * @class StoresController
   * @method show
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async show(req: Request, res: Response) {
    try {
      const product = await Product.findById(req.params.productId);

      const options = {
        title: 'Product',
        product,
      };
      res.render('stores/show', options);
    } catch (error) {
      return res.redirect('/store');
    }
  }
}
