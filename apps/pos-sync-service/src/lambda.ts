// AWS Lambda entry point (Function URL): the express app runs without listen()
import serverless from 'serverless-http';
import { app } from './app';

export const handler = serverless(app);
