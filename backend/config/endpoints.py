"""
Central registry of all API endpoint path fragments used across the
job board backend.

Why this file exists:
Every app's urls.py used to hardcode its own path strings (e.g.
'register/job_seeker/', 'login/admin/'). If the same fragment was
retyped elsewhere (tests, docs, another urls.py), a small typo would
silently break that route instead of raising an error.

Now every path string lives here ONCE. urls.py files, tests, and any
other code that needs to know an endpoint's path import the relevant
class from this file instead of retyping the string. If a path ever
needs to change, it changes here and everything that references it
stays correct automatically.

NOTE: These are the *fragments* passed to django.urls.path(), not
full URLs. The 'name=' kwarg on each path() call is unrelated to this
file and is left as-is in each urls.py.
"""


class APIPrefixes:
    """Top-level include() prefixes, wired in config/urls.py."""
    ACCOUNTS = 'api/v1/accounts/'
    COMPANIES = 'api/v1/companies/'
    JOBS = 'api/v1/jobs/'
    SKILLS = 'api/v1/skills/'
    JOB_APPLICATIONS = 'api/v1/job-applications/'


class AccountsEndpoints:
    REGISTER_JOB_SEEKER = 'register/job_seeker/'
    REGISTER_COMPANY_REP = 'register/company_rep/'

    LOGIN_JOB_SEEKER = 'login/job_seeker/'
    LOGIN_COMPANY_REP = 'login/company_rep/'
    LOGIN_ADMIN = 'login/admin/'

    AUTH_GOOGLE = 'auth/google/'

    PASSWORD_FORGOT = 'password/forgot/'
    PASSWORD_RESET = 'password/reset/'

    TOKEN_REFRESH = 'token/refresh/'
    PROFILE = 'profile/'
    LOGOUT = 'logout/'

    ADMIN_CREATE = 'admin/create/'
    ADMIN_STATS = 'admin/stats/'
    ADMIN_USERS = 'admin/users/'

    @classmethod
    def full_admin_stats_path(cls):
        """Full path for the admin stats endpoint (leading slash, for
        use with the Django test client), e.g. '/api/v1/accounts/admin/stats/'."""
        return '/' + APIPrefixes.ACCOUNTS + cls.ADMIN_STATS

    @classmethod
    def full_admin_users_path(cls, role=None):
        """Full path for the admin user list endpoint (leading slash,
        for use with the Django test client), e.g. '/api/v1/accounts/admin/users/'."""
        path = '/' + APIPrefixes.ACCOUNTS + cls.ADMIN_USERS
        if role:
            path += f'?role={role}'
        return path

    @classmethod
    def full_admin_create_path(cls):
        """Full path for the admin create endpoint (leading slash, for
        use with the Django test client), e.g. '/api/v1/accounts/admin/create/'."""
        return '/' + APIPrefixes.ACCOUNTS + cls.ADMIN_CREATE



class CompanyEndpoints:
    LIST_CREATE = ''
    MY_COMPANY = 'me/'
    JOIN = 'join/'
    PENDING = 'pending/'
    VERIFY = '<int:pk>/verify/'
    DETAIL = '<int:pk>/'

    @classmethod
    def full_list_create_path(cls):
        """Full path for the list/create endpoint (leading slash, for
        use with the Django test client), e.g. '/api/v1/companies/'."""
        return '/' + APIPrefixes.COMPANIES + cls.LIST_CREATE

    @classmethod
    def full_pending_path(cls):
        """Full path for the admin pending-companies list endpoint (leading slash,
        for use with the Django test client), e.g. '/api/v1/companies/pending/'."""
        return '/' + APIPrefixes.COMPANIES + cls.PENDING

    @classmethod
    def full_verify_path(cls, pk):
        """Full path for the admin company-verify endpoint (leading slash, with a
        real pk substituted in place of the '<int:pk>/' route converter, for use
        with the Django test client), e.g. '/api/v1/companies/5/verify/'."""
        return '/' + APIPrefixes.COMPANIES + f'{pk}/verify/'




class JobEndpoints:
    LIST_CREATE = ''
    DETAIL = '<int:pk>/'


class JobApplicationEndpoints:
    LIST_CREATE = ''
    COMPANY_LIST = 'company/'
    DETAIL = '<int:pk>/'


class SkillEndpoints:
    LIST_CREATE = ''
    DETAIL = '<int:pk>/'