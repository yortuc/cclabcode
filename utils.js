export function extractErrorInfo(err) {
    const start = err.stack.indexOf("<anonymous>:");
    const end = err.stack.indexOf(")", start + 11);
    const str = err.stack.substr(start + 12, end - 1).split(":");

    return {
        message: err.message,
        lineNumber: str[0] - 2,
        columnNumber: str[1],
    };
}