class LoggingRouter:
    """Route RequestLog model reads/writes to logs_db, everything else stays default."""

    route_app_labels = {"observability"}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return "logs_db"
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return "logs_db"
        return None

    def allow_relation(self, obj1, obj2, **hints):
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in self.route_app_labels:
            return db == "logs_db"
        if db == "logs_db":
            return False
        return None