import { Hono } from 'hono';
import { UserController } from '../controllers/userController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';
import { onboardingSchema } from '@shared/schemas/onboardingSchema';

// Type the Hono app to include our Context Variables
const userRoutes = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all routes in this group
userRoutes.use('*', authMiddleware);

// GET /api/me
userRoutes.get('/', UserController.getProfile);

// PUT /api/me/profile
userRoutes.put('/profile', validateBody(onboardingSchema), UserController.updateProfile);

export { userRoutes };
