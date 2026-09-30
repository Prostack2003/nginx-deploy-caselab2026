import { randomUUID } from 'node:crypto';

function requestIdMiddleware(request, response, next) {
    const id = randomUUID();
    request.id = id;
    response.setHeader('X-Request-Id', id);
    return next();
}

export { requestIdMiddleware };
