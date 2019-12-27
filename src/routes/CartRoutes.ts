import { Request, Response, Router } from 'express';
import { CartsController } from '../controllers/CartsController';
import Middleware = require('../Middleware');

const router = Router();
const controller = new CartsController();

// Get cart
router.get('/', Middleware.isCustomerOrAdmin, (req: Request, res: Response) =>
  controller.edit(req, res)
);

// Update cart
router.put('/', Middleware.isCustomerOrAdmin, (req: Request, res: Response) =>
  controller.update(req, res)
);

// Add an item to the cart
router.put(
  '/add/:productId',
  Middleware.isCustomerOrAdmin,
  (req: Request, res: Response) => controller.addToCart(req, res)
);

module.exports = router;
