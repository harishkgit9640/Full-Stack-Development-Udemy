class ErrorResponse extends Error {
    constructor(statusCode, errors = [], message = "something went wrong", stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.message = message;
        this.data = null;
        if (stack) {

            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ErrorResponse }