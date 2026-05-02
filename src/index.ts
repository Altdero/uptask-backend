import colors from 'colors';

import server from './server';

// Fallback Safety Net: Guarantees local development behavior if NODE_ENV is missing
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const port = process.env.PORT || 4000;

server.listen(port, () => {
  const message = port ? `Server up and running on port: ${port}` : 'Server up and running';
  console.log(colors.cyan.bold(message));
});
