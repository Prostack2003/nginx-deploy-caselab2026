class AppError extends Error {
    constructor(message, code, details = []) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
    }
}

export { AppError };
