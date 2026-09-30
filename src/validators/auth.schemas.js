import { z } from 'zod';

const emailSchema = z
    .string()
    .trim()
    .email('Укажите корректный email')
    .max(254, 'Email не должен превышать 254 символа')
    .transform((email) => email.toLowerCase());

const registrationPasswordSchema = z
    .string()
    .min(12, 'Пароль должен содержать не менее 12 символов')
    .max(72, 'Пароль не должен превышать 72 символа')
    .regex(/[a-z]/, 'Пароль должен содержать строчную латинскую букву')
    .regex(/[A-Z]/, 'Пароль должен содержать заглавную латинскую букву')
    .regex(/[0-9]/, 'Пароль должен содержать цифру');

const loginPasswordSchema = z
    .string()
    .min(1, 'Укажите пароль')
    .max(72, 'Пароль не должен превышать 72 символа');

const registerBodySchema = z
    .object({
        email: emailSchema,
        password: registrationPasswordSchema,
    })
    .strict();

const loginBodySchema = z
    .object({
        email: emailSchema,
        password: loginPasswordSchema,
    })
    .strict();

export {
    emailSchema,
    registrationPasswordSchema,
    registerBodySchema,
    loginBodySchema,
};
