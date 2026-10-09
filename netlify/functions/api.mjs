import serverless from 'serverless-http';
import { app } from '../../server/server.js';
import { initDatabase, saveDbNow } from '../../server/db.js';

// Ensure tables and seeds are initialized on cold start
try {
  initDatabase();
} catch (e) {
  console.warn('Database initialization warning in serverless function:', e);
}

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  // Prevent Lambda from waiting for background timers to empty
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  // Support both direct Netlify function URL and /api/* rewritten URL
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api');
    if (!event.path.startsWith('/api')) {
      event.path = '/api' + event.path;
    }
  }
  const response = await serverlessHandler(event, context);
  try {
    await saveDbNow();
  } catch (err) {
    console.warn('saveDbNow error in handler:', err);
  }
  return response;
};
