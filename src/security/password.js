import bcrypt from 'bcryptjs';
import { bcryptRounds } from '../config.js';

async function hashPassword(password) {
    return bcrypt.hash(password, bcryptRounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

export { hashPassword, verifyPassword };
