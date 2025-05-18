# =========================================================
# General Django Commands
# =========================================================

# Start the Django development server
start:
	poetry run python manage.py runserver

# Make migrations
migrate:
	docker compose run --rm web poetry run python manage.py migrate

# Create migrations
migrations:
	docker compose run --rm web poetry run python manage.py makemigrations
	@# If you want to delete migration folder, uncomment the next line
	# rm -rf app/migrations/*

# Create a Django superuser
createsuperuser:
	poetry run python manage.py createsuperuser

# Create a new Django app
new-app:
	poetry run python manage.py startapp $(app)
	@# To execute: make new-app app=cenas

# Clean up Python files (e.g., __pycache__)
pyclean:
	pyclean .



# =========================================================
# Docker Compose Commands
# =========================================================

# Start the application with Docker Compose (builds & recreates containers)
compose.start:
	docker compose up --build --force-recreate -d

# Run migrations with Docker Compose
compose.migrate:
	docker compose run --rm web poetry run python manage.py migrate

# Create a superuser with Docker Compose
compose.superuser:
	docker compose run --rm web poetry run python manage.py createsuperuser

# Bootstrap Docker Compose: start, migrate, and create superuser
compose.bootstrap:
	make compose.start
	sleep 5
	make compose.migrate
	make compose.superuser


# =========================================================
# Testing Commands
# =========================================================

# Run tests with poetry
tests:
	poetry run pytest -vvv --no-header

# Run tests with Docker Compose
compose.tests:
	docker compose run --rm -e DJANGO_SETTINGS_MODULE=dali.settings web poetry run pytest -vvv --no-header



# =========================================================
# CLI with Typer Commands
# =========================================================


# Display built-in Typer CLI help (lists all available commands and usage)
cli.help:
	docker compose run --rm -e DJANGO_SETTINGS_MODULE=dali.settings web poetry run python cli_typer.py --help

# List all characters
cli.list-characters:
	docker compose run --rm -e DJANGO_SETTINGS_MODULE=dali.settings web poetry run python cli_typer.py list-characters

# Delete a specific character
cli.delete-character:
	docker compose run --rm -e DJANGO_SETTINGS_MODULE=dali.settings web poetry run python cli_typer.py delete-character $(character_id)

# Show character statistics
cli.character-stats:
	docker compose run --rm -e DJANGO_SETTINGS_MODULE=dali.settings web poetry run python cli_typer.py character-stats

# Start development server on port 8000
cli.runserver:
	docker compose run --rm -p 8000:8000 web poetry run python cli_typer.py runserver