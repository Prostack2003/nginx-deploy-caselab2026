import { UnauthorizedError } from '../errors/unauthorized.error.js';
import * as userRepository from '../repositories/user.repository.js';
import { verifyAccessToken } from '../security/tokens.js';

function extractBearerToken(authorizationHeader) {
    if (typeof authorizationHeader !== 'string') {
        return null;
    }

    const parts = authorizationHeader.trim().split(/\s+/);

    if (
        parts.length !== 2 ||
        parts[0].toLowerCase() !== 'bearer' ||
        parts[1].length === 0
    ) {
        return null;
    }

    return parts[1];
}

async function authenticate(request, response, next) {
    const accessToken = extractBearerToken(request.headers.authorization);

    if (accessToken === null) {
        return next(
            new UnauthorizedError('Требуется действительный access-токен')
        );
    }

    let payload;

    try {
        payload = verifyAccessToken(accessToken);
    } catch {
        return next(
            new UnauthorizedError('Требуется действительный access-токен')
        );
    }

    const user = await userRepository.findById(payload.sub);

    if (user === null || !user.isActive) {
        return next(
            new UnauthorizedError('Требуется действительный access-токен')
        );
    }

    request.user = user;

    return next();
}

export { authenticate, extractBearerToken };
