import serverless from 'serverless-http';
import { app, ensureDbReady } from './server.js';
import { saveDbNow } from './db.js';

let serverlessHandler = null;

export const handler = async (event, context) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api');
    if (!event.path.startsWith('/api')) {
      event.path = '/api' + event.path;
    }
  }

  await ensureDbReady();

  if (!serverlessHandler) {
    serverlessHandler = serverless(app);
  }

  const response = await serverlessHandler(event, context);
  try {
    await saveDbNow();
  } catch (err) {
    console.warn('saveDbNow error in handler:', err);
  }
  return response;
};
