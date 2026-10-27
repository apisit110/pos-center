// AWS Lambda entry point (Function URL): the express app runs without listen()
import serverless from 'serverless-http';
import { app } from './app';

type FunctionUrlResponse = { headers?: Record<string, unknown>; cookies?: string[] };

const handle = serverless(app);

// a Function URL response sets cookies through `cookies`; serverless-http only fills it for 2+ cookies
// and leaves a single one (the login token) as a `set-cookie` header
export const handler = async (event: object, context: object) => {
  const response = (await handle(event, context)) as FunctionUrlResponse;
  const setCookie = response.headers?.['set-cookie'];
  if (typeof setCookie === 'string') {
    response.cookies = [...(response.cookies ?? []), setCookie];
    delete response.headers!['set-cookie'];
  }
  return response;
};
