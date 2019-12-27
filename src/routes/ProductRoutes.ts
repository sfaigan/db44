import { Request, Response, Router } from 'express';
import Middleware = require('../Middleware');
import { ProductsController } from '../controllers/ProductsController';

const router = Router();
const controller = new ProductsController();

// Get all products
router.get('/', Middleware.isSupplierOrAdmin, (req: Request, res: Response) =>
  controller.index(req, res)
);

// Get the new product page
router.get(
  '/new',
  Middleware.isSupplierOrAdmin,
  (req: Request, res: Response) => controller.new(req, res)
);

// Create a new product
router.post('/', Middleware.isSupplierOrAdmin, (req: Request, res: Response) =>
  controller.create(req, res)
);

// Get one product by id
router.get(
  '/:id',
  Middleware.isSupplierOfProductOrAdmin,
  (req: Request, res: Response) => controller.show(req, res)
);

// Get edit page for a product by id
router.get(
  '/edit/:id',
  Middleware.isSupplierOfProductOrAdmin,
  (req: Request, res: Response) => controller.edit(req, res)
);

// Update a product's details
router.put(
  '/:id',
  Middleware.isSupplierOfProductOrAdmin,
  (req: Request, res: Response) => controller.update(req, res)
);

// Delete a product, get to work with button, secured with middleware
router.get(
  '/delete/:id',
  Middleware.isSupplierOfProductOrAdmin,
  (req: Request, res: Response) => controller.delete(req, res)
);

module.exports = router;
