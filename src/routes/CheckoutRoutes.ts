import { Request, Response, Router } from 'express';
import { CheckoutsController } from '../controllers/CheckoutsController';
import Middleware = require('../Middleware');

const router = Router();
const controller = new CheckoutsController();

// Start checkout
router.get(
  '/',
  Middleware.isCustomerOrAdmin,
  Middleware.hasItemsInCart,
  (req: Request, res: Response) => controller.new(req, res)
);

// Submit billing and shipping info
router.put(
  '/',
  Middleware.isCustomerOrAdmin,
  Middleware.hasItemsInCart,
  (req: Request, res: Response) => controller.create(req, res)
);

// Review order details
router.get(
  '/review',
  Middleware.isCustomerOrAdmin,
  Middleware.hasItemsInCart,
  (req: Request, res: Response) => controller.show(req, res)
);

// Confirm order details
router.get(
  '/confirm',
  Middleware.isCustomerOrAdmin,
  Middleware.hasItemsInCart,
  (req: Request, res: Response) => controller.update(req, res)
);

module.exports = router;
