import { Request, Response } from 'express';
import { Order, OrderI } from '../models/Order';
import { ValidationError } from '../Validator';

export class CheckoutsController {
  /**
   * Renders the checkout review page
   *
   * @class CheckoutsController
   * @method show
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async show(req: Request, res: Response) {
    try {
      const userId = req!.session!.user._id;
      const cart = await Order.getCartFromUserId(userId);
      const products = await Order.parseLineItems(cart.items);
      const options = {
        title: 'Checkout Review',
        cart,
        products,
        numItemsInCart: await Order.getNumberOfItemsInCart(cart.items),
        cost: await Order.getTotalCostOfItems(products),
      };
      return res.render('checkouts/show', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Renders the checkout page
   *
   * @class CheckoutsController
   * @method new
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async new(req: Request, res: Response) {
    try {
      const userId = req!.session!.user._id;
      const cart = await Order.getCartFromUserId(userId);
      const products = await Order.parseLineItems(cart.items);

      const options: {} = {
        title: 'Checkout',
        message: 'Input payment and shipping details',
        cart,
        products,
        cost: await Order.getTotalCostOfItems(products),
      };
      return res.render('checkouts/new', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Creates a new checkout
   *
   * @class CheckoutsController
   * @method create
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/'
   */
  async create(req: Request, res: Response) {
    const data = this.getParams(req);
    const userId = req!.session!.user._id;
    try {
      const cart = await Order.getCartFromUserId(userId);
      await cart.update(data);

      return res.redirect('/checkout/review');
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/orders/edit/' + req.params.id);
    }
  }

  /**
   * Updates a checkout's details
   *
   * @class CheckoutsController
   * @method update
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/orders/:_id'
   */
  async update(req: Request, res: Response) {
    const data = {
      status: 'confirmed',
    };
    const userId = req!.session!.user._id;
    try {
      const cart = await Order.getCartFromUserId(userId);
      await cart.update(data);
      await Order.createCart(userId);
      req.app.locals.numItemsInCart = 0;
      return res.redirect('/orders/' + cart._id);
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/checkouts/show');
    }
  }

  private getParams(req: Request) {
    const params: Partial<Order> = {
      billingAddress: {
        firstName: req.body.billingAddressFirstName,
        lastName: req.body.billingAddressLastName,
        line1: req.body.billingAddressLine1,
        line2: req.body.billingAddressLine2,
        city: req.body.billingAddressCity,
        province: req.body.billingAddressProvince,
        country: req.body.billingAddressCountry,
        postalCode: req.body.billingAddressPostalCode,
      },
      shippingAddress: {
        firstName: req.body.shippingAddressFirstName,
        lastName: req.body.shippingAddressLastName,
        line1: req.body.shippingAddressLine1,
        line2: req.body.shippingAddressLine2,
        city: req.body.shippingAddressCity,
        province: req.body.shippingAddressProvince,
        country: req.body.shippingAddressCountry,
        postalCode: req.body.shippingAddressPostalCode,
      },
      paymentMethod: 'Credit Card',
    };
    return params;
  }
}
