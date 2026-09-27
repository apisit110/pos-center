import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginSchema } from '../dtos/request/LoginRequestDto';

const JWT_SECRET = 'your-secret-key';

export function authRoutes(): Router {
  const router = Router();

  router.post('/login', (req: Request, res: Response) => {
    const { username, password } = loginSchema.parse(req.body);

    if (username === 'admin' && password === 'admin') {
      const token = jwt.sign({ uid: 'admin-id-123' }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ token });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  });

  return router;
}
