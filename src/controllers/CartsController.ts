import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { LineItem } from '../interfaces/LineItem';
import { ValidationError } from '../Validator';

export class CartsController {
  /**
   * Renders the cart page
   *
   * @class CartsController
   * @method edit
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async edit(req: Request, res: Response) {
    try {
      const userId = req!.session!.user._id;
      const cart = await Order.getCartFromUserId(userId);
      const products = await Order.parseLineItems(cart.items as LineItem[]);

      const options = {
        products,
        cost: await Order.getTotalCostOfItems(products),
      };
      return res.render('carts/edit', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Updates a cart's data
   *
   * @class CartsController
   * @method update
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/cart'
   */
  async update(req: Request, res: Response) {
    const products = Array.prototype.slice.call(req.body.products);
    const userId = req!.session!.user._id;
    try {
      req.app.locals.numItemsInCart = await Order.updateCart(userId, products);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
    }

    return res.redirect('/cart');
  }

  /**
   * Adds an item to the cart
   *
   * @class CartsController
   * @method addToCart
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async addToCart(req: Request, res: Response) {
    const userId = req!.session!.user._id;
    const quantity = Number.parseInt(req.body.quantity, 10);
    const productId = req.params.productId;

    try {
      const productName = await Product.getNameFromId(productId);
      await Order.addToCart(userId, productId, quantity);
      req.app.locals.numItemsInCart += quantity;
      req.flash(
        'success_messages',
        `Added ${productName} x${quantity} to cart`
      );
      return res.redirect('/store');
    } catch (error) {
      return res.redirect('/store');
    }
  }
}
