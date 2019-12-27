import { Request, Response, Router } from 'express';
import { MiscController } from '../controllers/MiscController';

const router = Router();
const controller = new MiscController();

// Get home page
router.get('/', (req: Request, res: Response) => controller.index(req, res));

module.exports = router;
