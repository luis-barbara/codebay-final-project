FROM python:3.12-slim

RUN pip install poetry

WORKDIR /app

COPY poetry.lock pyproject.toml /app/

COPY . .

RUN poetry install -n 

EXPOSE 8000

RUN poetry run python manage.py collectstatic --noinput

VOLUME [ "/app" ]

CMD ["poetry", "run", "uvicorn", "codebay.asgi:application", "--host", "0.0.0.0", "--port", "8000"]

