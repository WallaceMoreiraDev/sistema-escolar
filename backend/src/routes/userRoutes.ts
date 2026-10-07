import { Hono } from 'hono';
import { z } from 'zod';
import { UserController } from '../controllers/userController';
import { authMiddleware, Variables } from '../middlewares/authMiddleware';
import { onboardingSchema } from '@shared/schemas/onboardingSchema';
import { AppError } from '../utils/AppError';

// Type the Hono app to include our Context Variables
const userRoutes = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all routes in this group
userRoutes.use('*', authMiddleware);

userRoutes.get('/', UserController.getProfile);

const validateProfile = async (c: any, next: any) => {
  try {
    const body = await c.req.json();
    onboardingSchema.parse(body);
    c.set('validBody', body);
    await next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ success: false, code: 'VALIDATION_ERROR', details: err.issues }, 400);
    }
    throw err;
  }
};

userRoutes.put('/profile', validateProfile, UserController.updateProfile);

export { userRoutes };
