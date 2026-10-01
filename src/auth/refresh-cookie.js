import { refreshCookieName, refreshTokenTtlDays } from '../config.js';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const refreshCookieOptions = Object.freeze({
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: refreshTokenTtlDays * MILLISECONDS_PER_DAY,
});

function setRefreshCookie(response, refreshToken) {
    response.cookie(refreshCookieName, refreshToken, refreshCookieOptions);
}

export { setRefreshCookie, refreshCookieOptions };
