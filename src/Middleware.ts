import { NextFunction, Request, Response } from 'express';
import { Product } from './models/Product';
import { Order } from './models/Order';

class Middleware {
  // Checks if the user is authenticated
  static unauthenticated(req: Request, res: Response) {
    req.flash('error_messages', 'Please login to do that action.');
    return res.redirect('/session/login');
  }

  // Checks if the user is an admin
  isAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req!.session!.user;
    if (!user) return Middleware.unauthenticated(req, res);

    if (user.role === 'administrator') {
      return next();
    }
    req.flash('error_messages', 'You do not have permission to do that action');
    return res.redirect('/');
  }

  // Checks if the user is a supplier or an admin
  isSupplierOrAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req!.session!.user;
    if (!user) return Middleware.unauthenticated(req, res);
    if (user.role === 'supplier' || user.role === 'administrator') {
      return next();
    }
    req.flash('error_messages', 'You do not have permission to do that action');
    return res.redirect('/');
  }

  // Checks if the user is a customer or an admin
  isCustomerOrAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req!.session!.user;
    if (!user) return Middleware.unauthenticated(req, res);
    if (user.role === 'customer' || user.role === 'administrator') {
      return next();
    }
    req.flash('error_messages', 'You do not have permission to do that action');
    return res.redirect('/');
  }

  // Checks if the user has any items in their cart
  hasItemsInCart(req: Request, res: Response, next: NextFunction) {
    const user = req!.session!.user;
    const numItemsInCart = req!.app.locals.numItemsInCart;
    if (!user) return Middleware.unauthenticated(req, res);
    if (numItemsInCart) {
      return next();
    }
    req.flash('error_messages', 'You do not have any items in your cart.');
    return res.redirect('/store');
  }

  async orderedThatOrAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req!.session!.user;
    if (!user) return Middleware.unauthenticated(req, res);
    const order = await Order.findById(req.params.id);
    if (
      (user.role === 'customer' &&
        user._id.toString() === order.userId.toString()) ||
      user.role === 'administrator'
    ) {
      return next();
    }
    req.flash('error_messages', 'You do not have permission to do that action');
    return res.redirect('/');
  }

  // Checks if the user is a supplier with a supplierId matching that of the product (for editing/viewing products)
  // or if they're an admin
  async isSupplierOfProductOrAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req!.session!.user;
    if (!user) return Middleware.unauthenticated(req, res);
    const product = await Product.findById(req.params.id);
    if (
      (user.role === 'supplier' &&
        user.supplierId.toString() === product.supplier._id.toString()) ||
      user.role === 'administrator'
    ) {
      return next();
    }
    req.flash('error_messages', 'You do not have permission to do that action');
    return res.redirect('/');
  }

  // Checks if the current user is a supplier with a supplierId matching the id in the URL (for supplier actions)
  // or if they're an admin
  async worksThereOrAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req!.session!.user;
    if (!user) return Middleware.unauthenticated(req, res);
    if (
      (user.role === 'supplier' && user.supplierId === req.params.id) ||
      user.role === 'administrator'
    ) {
      return next();
    }
    req.flash('error_messages', 'You do not have permission to do that action');
    return res.redirect('/');
  }

  // Checks if the current user's id matches the id in the URL (for editing/viewing a user)
  // or if they're an admin
  isThatUserOrAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req!.session!.user;
    if (!user) return Middleware.unauthenticated(req, res);
    if (user._id === req.params.id || user.role === 'administrator') {
      return next();
    }
    req.flash('error_messages', 'You do not have permission to do that action');
    return res.redirect('/');
  }
}

export = new Middleware();
