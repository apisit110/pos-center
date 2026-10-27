// local / docker entry point; Lambda starts from lambda.ts
import { app } from './app';

const port = process.env.PORT || 4002;
app.listen(port, () => {
  console.log(`[pos-sync-service]: Server is running at http://localhost:${port}`);
});
