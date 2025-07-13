import Fastify from 'fastify';
import { userRoutes } from './routes/user.routes';
import { authRoutes } from './routes/auth.routes';

export const app = Fastify({
    logger: true,
})

app.get('/', async (__, _) => {
    return { hello: 'world' }
});

app.register(authRoutes);
app.register(userRoutes);

