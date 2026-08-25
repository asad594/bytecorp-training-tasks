import contextvars

correlation_id_var = contextvars.ContextVar("correlation_id", default=None)
error_info_var = contextvars.ContextVar("error_info", default=None)


def get_correlation_id():
    return correlation_id_var.get()


def set_error_info(error_type, error_message):
    error_info_var.set({"error_type": error_type, "error_message": error_message})


def get_error_info():
    return error_info_var.get()