import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());

app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ uid: 'admin-id-123' }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`[portal-service]: Server is running at http://localhost:${port}`);
});
