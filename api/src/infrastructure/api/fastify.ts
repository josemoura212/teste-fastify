import Fastify from 'fastify';

export const app = Fastify({
    logger: true,
})

app.get('/', async (request, reply) => {
    return { hello: 'world' }
});

