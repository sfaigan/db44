import { Request, Response } from 'express';
import { Product, ProductI } from '../models/Product';
import { ValidationError } from '../Validator';
import { ObjectId } from 'mongodb';

export class ProductsController {
  /**
   * Renders a table of all the products
   *
   * @class ProductsController
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async index(req: Request, res: Response) {
    const user = req!.session!.user;
    try {
      let products: Product[] = [];
      if (user.role === 'administrator') {
        products = await Product.findAll();
      } else if (user.role === 'supplier') {
        const supplierId = new ObjectId(user.supplierId);
        products = await Product.findAll({ supplierId });
      }
      return res.render('products/index', { products });
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Renders a single product's details
   *
   * @class ProductsController
   * @method show
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async show(req: Request, res: Response) {
    try {
      const product = await Product.findById(req.params.id);
      return res.render('products/show', { product });
    } catch (error) {
      return res.redirect('/products');
    }
  }

  /**
   * Renders the new product view
   *
   * @class ProductsController
   * @method new
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async new(req: Request, res: Response) {
    res.render('products/new');
  }

  /**
   * Creates a new product
   *
   * @class ProductsController
   * @method create
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/'
   */
  async create(req: Request, res: Response) {
    const data = {
      name: req.body.name,
      description: req.body.description,
      stock: Number(req.body.stock),
      price: Number(req.body.price),
      category: req.body.category.toLowerCase(),
      supplierId: new ObjectId(req.body.supplierId),
    };

    let newProduct: Product;

    try {
      newProduct = await Product.create(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/products/new');
    }
    return res.redirect('/products/' + newProduct._id);
  }

  /**
   * Renders the edit page for a product
   *
   * @class ProductsController
   * @method edit
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async edit(req: Request, res: Response) {
    try {
      const product = await Product.findById(req.params.id);
      return res.render('products/edit', { product });
    } catch (error) {
      res.redirect('/products');
    }
  }

  /**
   * Updates a product's details
   *
   * @class ProductsController
   * @method update
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/products/:_id'
   */
  async update(req: Request, res: Response) {
    const data: Partial<ProductI> = {};
    // Add properties if the values are defined in the update data
    if (req.body.name) data.name = req.body.name;
    if (req.body.description) data.description = req.body.description;
    if (req.body.price) data.price = Number(req.body.price);
    if (req.body.stock) data.stock = Number(req.body.stock);
    if (req.body.category) data.category = req.body.category.toLowerCase();

    try {
      const product = await Product.findById(req.params.id);
      await product.update(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/products/edit/' + req.params.id);
    }
    return res.redirect('/products/' + req.params.id);
  }

  /**
   * Deletes a product
   *
   * @class ProductsController
   * @method delete
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/products'
   */
  async delete(req: Request, res: Response) {
    try {
      const product = await Product.findById(req.params.id);

      await product.delete();
    } catch (error) {}

    return res.redirect('/products');
  }
}
