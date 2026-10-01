import { refreshCookieName, refreshTokenTtlDays } from '../config.js';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const refreshCookieBaseOptions = Object.freeze({
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth',
});

const refreshCookieOptions = Object.freeze({
    ...refreshCookieBaseOptions,
    maxAge: refreshTokenTtlDays * MILLISECONDS_PER_DAY,
});

function setRefreshCookie(response, refreshToken) {
    response.cookie(refreshCookieName, refreshToken, refreshCookieOptions);
}

function clearRefreshCookie(response) {
    response.clearCookie(refreshCookieName, refreshCookieBaseOptions);
}

export { setRefreshCookie, clearRefreshCookie, refreshCookieOptions };
