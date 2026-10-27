// local / docker entry point; Lambda starts from lambda.ts
import { app } from './app';

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`[portal-service]: Server is running at http://localhost:${port}`);
});
