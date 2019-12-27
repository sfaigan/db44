import { Request, Response } from 'express';
import { Order, OrderI } from '../models/Order';
import { ObjectId } from 'mongodb';
import { ValidationError } from '../Validator';

export class OrdersController {
  /**
   * Renders a table of all the orders
   *
   * @class OrdersController
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async index(req: Request, res: Response) {
    const user = req!.session!.user;
    try {
      let orders: Order[] = [];
      if (user.role === 'administrator') {
        orders = await Order.findAll();
      } else if (user.role === 'customer') {
        const userId = new ObjectId(user._id);
        orders = await Order.findAll({ userId });
      }
      const options = {
        title: 'Orders List',
        orders,
      };

      return res.render('orders/index', options);
    } catch (error) {
      return res.redirect('/');
    }
  }

  /**
   * Renders a single order's details
   *
   * @class OrdersController
   * @method show
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async show(req: Request, res: Response) {
    try {
      const order = await Order.findById(req.params.id);
      const items = await Order.parseLineItems(order.items);
      const options = {
        title: 'Order Details',
        order,
        items,
      };
      return res.render('orders/show', options);
    } catch (error) {
      return res.redirect('/orders');
    }
  }

  /**
   * Renders the edit page for a order
   *
   * @class OrdersController
   * @method edit
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   */
  async edit(req: Request, res: Response) {
    try {
      const order = await Order.findById(req.params.id);
      const options = {
        title: 'Orders List',
        order,
      };
      return res.render('orders/edit', options);
    } catch (error) {
      return res.redirect('/orders');
    }
  }

  /**
   * Updates a order's details
   *
   * @class OrdersController
   * @method update
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/orders/:_id'
   */
  async update(req: Request, res: Response) {
    let billingAddress;
    let shippingAddress;
    let items;
    try {
      billingAddress =
        req.body.billingAddress && typeof req.body.billingAddress === 'string'
          ? JSON.parse(req.body.billingAddress)
          : req.body.billingAddress;
      shippingAddress =
        req.body.shippingAddress && typeof req.body.shippingAddress === 'string'
          ? JSON.parse(req.body.shippingAddress)
          : req.body.shippingAddress;
      items =
        req.body.items && typeof req.body.items === 'string'
          ? JSON.parse(req.body.items)
          : req.body.items;
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/orders/edit/' + req.params.id);
    }

    const data: Partial<OrderI> = {};
    // Add properties if the values are defined in the update data
    if (req.body.userId) data.userId = new ObjectId(req.body.userId);
    if (req.body.billingAddress) data.billingAddress = billingAddress;
    if (req.body.shippingAddress) data.shippingAddress = shippingAddress;
    if (req.body.paymentMethod) data.paymentMethod = req.body.paymentMethod;
    if (req.body.status) data.status = req.body.status;
    if (req.body.items) data.items = items;

    try {
      const order = await Order.findById(req.params.id);
      await order.update(data);
      if (order.status === 'cart') {
        req.app.locals.numItemsInCart = await Order.getNumberOfItemsInCart(
          items
        );
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        req.flash('error_messages', error.message);
      }
      return res.redirect('/orders/edit/' + req.params.id);
    }
    return res.redirect('/orders/' + req.params.id);
  }

  /**
   * Deletes an order
   *
   * @class OrdersController
   * @method delete
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @returns redirect to '/orders'
   */
  async delete(req: Request, res: Response) {
    try {
      const order = await Order.findById(req.params.id);
      await order.delete();
    } catch (errors) {}
    return res.redirect('/orders');
  }
}
