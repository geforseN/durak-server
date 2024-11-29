
import Fastify from 'fastify'
import createFastify from './app.js';

const start = async () => {
  const port = 10000;
  try {
    console.log('[Fastify] creating...');
    const fastify = await createFastify(Fastify(), {})
    console.log('[Fastify] trying to listen...');
    await fastify.listen({ port });
    console.log(`[Fastify] listening on port ${port}`);
  } catch (err) {
    console.error(`[Fastify] failed to start: ${err}`);
    console.error(err);
    throw err;
  }
}

start().catch(() => {
  console.log('fooo')
  process.exitCode = 1;
});
