import { Request, Response, Router } from 'express';
import Middleware = require('../Middleware');
import { SuppliersController } from '../controllers/SuppliersController';

const router = Router();
const controller = new SuppliersController();

// Get all suppliers
router.get('/', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.index(req, res)
);

// Register (create) a new supplier
router.post('/', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.create(req, res)
);

// Get a supplier by id
router.get('/:id', (req: Request, res: Response) => controller.show(req, res));

// Get edit page for a supplier by id
router.get(
  '/edit/:id',
  Middleware.worksThereOrAdmin,
  (req: Request, res: Response) => controller.edit(req, res)
);

// Update a supplier's details
router.put(
  '/:id',
  Middleware.worksThereOrAdmin,
  (req: Request, res: Response) => controller.update(req, res)
);

// Delete a supplier
router.get('/delete/:id', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.delete(req, res)
);

module.exports = router;
