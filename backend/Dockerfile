FROM python:3.12-slim

RUN pip install poetry

WORKDIR /app

# O ambiente virtual vai ser criado fora de /app, 
# e o volume - ./:/app/ no docker-compose.yml não vai sobrescrever a .venv (dava erro, nao encontrava django por ex.)
ENV POETRY_VIRTUALENVS_IN_PROJECT=false
ENV POETRY_VIRTUALENVS_PATH=/root/.cache/pypoetry/virtualenvs

COPY poetry.lock pyproject.toml /app/

COPY . .

RUN poetry install -n

EXPOSE 8000

RUN poetry run python manage.py collectstatic --noinput

VOLUME [ "/app" ]

CMD ["poetry", "run", "uvicorn", "codebay.asgi:application", "--host", "0.0.0.0", "--port", "8000"]

