import * as authService from '../services/auth.service.js';
import { setRefreshCookie } from '../auth/refresh-cookie.js';

async function register(request, response) {
    const user = await authService.register(request.body);

    return response.status(201).json({
        data: user,
    });
}

async function login(request, response) {
    const { user, accessToken, refreshToken } = await authService.login(
        request.body
    );

    setRefreshCookie(response, refreshToken);

    return response.status(200).json({
        data: {
            user,
            accessToken,
        },
    });
}

export { register, login };
