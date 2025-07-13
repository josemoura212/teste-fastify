import { app } from "./fastify";

app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        app.log.error(err);
    }
    app.log.info(`Server listening at ${address}`);
});
