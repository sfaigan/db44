import { Request, Response, Router } from 'express';
import Middleware = require('../Middleware');
import { UsersController } from '../controllers/UsersController';

const router = Router();
const controller = new UsersController();

// Get all users
router.get('/', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.index(req, res)
);

// Get registration page
router.get('/register', (req: Request, res: Response) =>
  controller.new(req, res)
);

// Register (create) a new user
router.post('/', (req: Request, res: Response) => controller.create(req, res));

// Get a user by id
router.get(
  '/:id',
  Middleware.isThatUserOrAdmin,
  (req: Request, res: Response) => controller.show(req, res)
);

// Get edit page for a user by id
router.get(
  '/edit/:id',
  Middleware.isThatUserOrAdmin,
  (req: Request, res: Response) => controller.edit(req, res)
);

// Update a user's details
router.put(
  '/:id',
  Middleware.isThatUserOrAdmin,
  (req: Request, res: Response) => controller.update(req, res)
);

// Delete a user
router.get('/delete/:id', Middleware.isAdmin, (req: Request, res: Response) =>
  controller.delete(req, res)
);

module.exports = router;
