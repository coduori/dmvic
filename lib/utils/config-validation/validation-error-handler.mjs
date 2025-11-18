const yupValidationError = (yupErrors) => {
    const formattedErrors = formatYupErrors(yupErrors);
    return {
        success: false,
        errors: formattedErrors,
        message: 'Validation failed!',
    };
};

const formatYupErrors = (yupErrors) =>
    yupErrors.inner.map((error) => ({
        field: error.path,
        message: error.message,
        value: error.value,
    }));

export { yupValidationError };
