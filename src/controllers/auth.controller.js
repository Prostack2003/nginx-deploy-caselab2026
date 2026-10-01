import * as authService from '../services/auth.service.js';
import { refreshCookieName } from '../config.js';
import {
    clearRefreshCookie,
    setRefreshCookie,
} from '../auth/refresh-cookie.js';

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

async function refresh(request, response) {
    const currentRefreshToken = request.cookies?.[refreshCookieName];

    const { accessToken, refreshToken } =
        await authService.refresh(currentRefreshToken);

    setRefreshCookie(response, refreshToken);

    return response.status(200).json({
        data: {
            accessToken,
        },
    });
}

async function logout(request, response) {
    const refreshToken = request.cookies?.[refreshCookieName];

    await authService.logout(refreshToken);
    clearRefreshCookie(response);

    return response.status(204).send();
}

export { register, login, refresh, logout };
