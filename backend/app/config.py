from shlex import split
from urllib.parse import quote

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DB_CON_STR: str | None = None
    PROJECT_NAME: str = "Recruiter-AI Backend"
    VERSION: str = "1.0.0"
    ENV: str = "local"
    PORT: int = 5000

    @property
    def sqlalchemy_database_url(self) -> str:
        if not self.DB_CON_STR:
            raise RuntimeError(
                "DB_CON_STR is required. Configure it with your Aiven PostgreSQL "
                "connection string in backend/.env."
            )

        raw = self.DB_CON_STR.strip()
        if raw.startswith("postgresql+psycopg://"):
            return raw
        if raw.startswith("postgresql://"):
            return raw.replace("postgresql://", "postgresql+psycopg://", 1)
        if raw.startswith("postgres://"):
            return raw.replace("postgres://", "postgresql+psycopg://", 1)

        """
        Convert libpq connection string to SQLAlchemy URL.
        Input:  dbname=defaultdb user=avnadmin password=... host=... port=18636 sslmode=require
        Output: postgresql+psycopg://avnadmin:...@host:18636/defaultdb?sslmode=require
        """
        parts: dict[str, str] = {}
        for token in split(raw):
            if "=" in token:
                k, v = token.split("=", 1)
                parts[k.strip()] = v.strip()

        user = parts.get("user", "")
        password = parts.get("password", "")
        host = parts.get("host", "")
        port = parts.get("port", "5432")
        dbname = parts.get("dbname", "")
        sslmode = parts.get("sslmode", "require")

        missing = [
            key
            for key, value in {
                "user": user,
                "password": password,
                "host": host,
                "dbname": dbname,
            }.items()
            if not value
        ]
        if missing:
            raise RuntimeError(
                "DB_CON_STR is missing required Aiven PostgreSQL fields: "
                + ", ".join(missing)
            )

        return (
            f"postgresql+psycopg://{quote(user, safe='')}:{quote(password, safe='')}@"
            f"{host}:{port}/{quote(dbname, safe='')}"
            f"?sslmode={sslmode}"
        )


settings = Settings()
