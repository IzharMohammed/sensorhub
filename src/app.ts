import Fastify, { FastifyInstance } from 'fastify'

const server: FastifyInstance = Fastify({
    logger: true
})

server.get("/healthcheck", async function () {
    return { status: "OK" }
})

async function main() {
    try {
        // await server.listen(3000, "0.0.0.0");
        await server.listen({ port: 3000, host: "0.0.0.0" })
        console.log(`Server ready at http://localhost:3000`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();