const serverless = require('serverless-http');

let handlerPromise = null;

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const { app } = await import('../../server/server.js');
      const { initDatabase, saveDbNow } = await import('../../server/db.js');
      try {
        initDatabase();
      } catch (e) {
        console.warn('initDatabase warning:', e);
      }
      const serverlessHandler = serverless(app);
      return { serverlessHandler, saveDbNow };
    })();
  }
  return handlerPromise;
}

exports.handler = async (event, context) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api');
    if (!event.path.startsWith('/api')) {
      event.path = '/api' + event.path;
    }
  }
  const { serverlessHandler, saveDbNow } = await getHandler();
  const response = await serverlessHandler(event, context);
  try {
    await saveDbNow();
  } catch (err) {
    console.warn('saveDbNow error in handler:', err);
  }
  return response;
};
