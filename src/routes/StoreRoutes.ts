import { Request, Response, Router } from 'express';
import { StoresController } from '../controllers/StoresController';

const router = Router();
const controller = new StoresController();

// Get product details
router.get('/:productId', (req: Request, res: Response) =>
  controller.show(req, res)
);

// Get the store
router.get('/', (req: Request, res: Response) => controller.index(req, res));

module.exports = router;
