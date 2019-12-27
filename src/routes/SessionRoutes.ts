import { Request, Response, Router } from 'express';
import { SessionsController } from '../controllers/SessionsController';

const router = Router();
const controller = new SessionsController();

// Get login page
router.get('/login', (req: Request, res: Response) => controller.new(req, res));

// Authenticate a user (create a new Session)
router.post('/authenticate', (req: Request, res: Response) =>
  controller.create(req, res)
);

// Log out (delete the user's Session)
router.get('/logout', (req: Request, res: Response) =>
  controller.delete(req, res)
);

module.exports = router;
