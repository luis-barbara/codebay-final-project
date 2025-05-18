# codebay-final-project
A marketplace to buy and sell digital assets


## Project Structure
```bash
├── products/                                   # Django app for product management
│   ├── migrations/                             # Database migrations
│   ├── templates/                              # HTML templates for rendering views
│   │   ├── products/                           # Templates related to product management
│   │   │   ├── product_confirm_delete.html     # Confirmation page for deleting a product
│   │   │   ├── product_list.html               # Page listing all products
│   │   │   ├── product_update.html             # Form for updating an existing product
│   │   │   ├── create_product.html             # Form for creating a new product
│   │   │   ├── product_detail.html             # Single product detail view
│   │   │   ├── checkout_success.html           # Stripe checkout success page
│   │   │   ├── ...
│   │   │   ├── index.html                      # Homepage for characters
│   │   ├── registration/                       # Authentication-related templates
│   │   │   ├── signin.html                     # User login page
│   │   │   ├── signup.html                     # User signup page
│   │   ├── base.html                           # Base template for consistent styling across pages
│   ├── tests/                                  # Unit tests for the application
│   ├── __init__.py
│   ├── admin.py                                # Django Admin configuration
│   ├── apps.py                                 # Application configuration
│   ├── product.json                            # Sample data for testing database
│   ├── forms.py                                # Form handling logic
│   ├── stripe_service.py                       # Stripe payment logic
│   ├── getstream_service.py                    # GetStream messaging logic
│   ├── models.py                               # Database models defining characters
│   ├── tests.py                                # Unit tests for character-related features
│   ├── urls.py                                 # URL routing for character-related views
│   ├── views.py                                # Application views handling requests
│ 
├── codebay/                                    # Django project settings and configurations
│   ├── __init__.py
│   ├── asgi.py                                 # ASGI application entry point (for async support)
│   ├── manage.py                               # 
│   ├── settings.py                             # Django settings (database, middleware, authentication, etc.)
│   ├── urls.py                                 # Project-wide URL configuration
│   ├── wsgi.py                                 # WSGI application entry point (for production servers)
│ 
├── static/                                     # Static files (CSS, JS, images)
├── docker-compose.yml                          # Docker Compose configuration for services (web, db, adminer)
├── Dockerfile                                  # Docker setup for containerized deployment
├── Makefile                                    # Helper commands for managing the project easily
├── LICENSE                                     # Licensing information for the project
├── poetry.lock                                 # Poetry dependencies lockfile (ensures consistency)
├── pyproject.toml                              # Poetry dependency manager configuration
├── pytest.ini                                  # Pytest configuration for test discovery and execution
├── manage.py                                   # Django management commands entry point
└── README.md                                   # Project documentation with setup, usage, and deployment instructions
```