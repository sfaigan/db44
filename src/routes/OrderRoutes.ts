import { Request, Response, Router } from 'express';
import Middleware = require('../Middleware');
import { OrdersController } from '../controllers/OrdersController';

const router = Router();
const controller = new OrdersController();

// Get all orders
router.get('/', Middleware.isCustomerOrAdmin, (req: Request, res: Response) =>
  controller.index(req, res)
);

// Get one order's details
router.get(
  '/:id',
  Middleware.orderedThatOrAdmin,
  (req: Request, res: Response) => controller.show(req, res)
);

// Get the edit page for an order by id
router.get('/edit/:id', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.edit(req, res)
);

// Update an order's details
router.put('/:id', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.update(req, res)
);

// Delete an order
router.get('/delete/:id', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.delete(req, res)
);

module.exports = router;
