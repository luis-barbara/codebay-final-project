
# CodeBay - Digital Marketplace Platform

CodeBay is a digital marketplace where developers and creators can buy and sell code snippets, templates, graphics, and other digital assets. The platform features secure transactions, user authentication, and integrations with Stripe for payments and GetStream for real-time messaging.

## Key Features
- **User Authentication**: Secure signup, login, and logout
- **Product Management**: Create, edit, view, and delete digital products
- **Payment Processing**: Stripe integration for secure transactions
- **Real-time Messaging**: GetStream integration for buyer-seller communication
- **Containerized Architecture**: Docker Compose for easy deployment
- **Reliable Database**: PostgreSQL for data storage
- **Comprehensive Testing**: Pytest for unit and integration tests

## Technology Stack
- **Backend**: Django
- **Database**: PostgreSQL
- **Payments**: Stripe API
- **Messaging**: GetStream API
- **Containerization**: Docker + Docker Compose
- **Testing**: Pytest
- **Dependency Management**: Poetry

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
│   │   ├── registration/                       # Authentication-related templates
│   │   │   ├── signin.html                     # User login page
│   │   │   ├── signup.html                     # User signup page
│   │   ├── base.html                           # Base template for consistent styling
│   ├── tests/                                  # Unit tests
│   ├── admin.py                                # Django Admin configuration
│   ├── apps.py                                 # App configuration
│   ├── forms.py                                # Form handling logic
│   ├── stripe_service.py                       # Stripe payment logic
│   ├── getstream_service.py                    # GetStream messaging logic
│   ├── models.py                               # Database models
│   ├── urls.py                                 # URL routing
│   ├── views.py                                # Application views
│ 
├── codebay/                                    # Django project settings
│   ├── settings.py                             # Project settings
│   ├── urls.py                                 # Project-wide URLs
│   ├── wsgi.py                                 # WSGI config
│ 
├── static/                                     # Static files
├── docker-compose.yml                          # Docker Compose config
├── Dockerfile                                  # Docker setup
├── Makefile                                    # Helper commands
├── LICENSE                                     # MIT License
├── poetry.lock                                 # Poetry lockfile
├── pyproject.toml                              # Poetry config
├── pytest.ini                                  # Pytest config
└── README.md                                   # This file
```

## 🚀 Features

# User Authentication

Secure registration and login system  
Password reset functionality   
Profile management  

# Product Management

Create digital products with titles, descriptions, and pricing   
Upload product files (code snippets, templates, graphics)   
Categorize products for easy discovery   
Edit and delete products   
 
# Payment Processing

Stripe integration for secure payments   
Checkout process with success/failure handling   
Purchase history tracking   

# Docker Deployment

Containerized PostgreSQL database   
Easy setup with Docker Compose   
Adminer for database management   

# Requirements

Before you begin, ensure you have the following installed:
- [Docker](https://www.docker.com/get-started) 
- [Poetry](https://python-poetry.org/docs/#installation)
- [Python 3.12](https://www.python.org/downloads/)



## **🛠️ Technology Stack**  
| Layer          | Technology           |
|----------------|----------------------|
| **Frontend**   | Html, Css, Javascript|
| **Backend**    | Node.js, Express     |
| **Database**   | MongoDB (Atlas)      |
| **Auth**       | JWT, OAuth 2.0       |
| **Storage**    | AWS S3 + CloudFront  |


## 🚀 Getting Started
-Prerequisites:

-Django (>=5.1.7,<6.0.0)"   
-Python-dotenv (>=1.0.1,<2.0.0)"   
-Openai (>=1.68.2,<2.0.0)"   
-Psycopg2-binary (>=2.9.10,<3.0.0)"   
-Uvicorn (>=0.34.0,<0.35.0)"   
-Whitenoise (>=6.9.0,<7.0.0)"    
-Typer (>=0.15.2,<0.16.0)"    
-Djangorestframework (>=3.16.0,<4.0.0)"   
-Django-allauth (>=65.9.0,<66.0.0)"   
-Pillow (>=11.2.1,<12.0.0)"   
-Djangorestframework-simplejwt (>=5.5.0,<6.0.0)"   
-Social-auth-app-django (>=5.4.3,<6.0.0)"   
-Django-storages (>=1.14.6,<2.0.0)"   
-Google-api-python-client (>=2.171.0,<3.0.0)"   
-Google-auth-httplib2 (>=0.2.0,<0.3.0)"   
-Google-auth-oauthlib (>=1.2.2,<2.0.0)"   
-Boto3 (>=1.38.31,<2.0.0)"   
-Stripe (>=12.2.0,<13.0.0)"   
-Stream-chat (>=4.24.0,<5.0.0)"   
-Django-cors-headers (>=4.7.0,<5.0.0)"   
-AWS S3 account (for file storage) or alternative   
-LiveServer Extensions   



## Installation
# Clone the Repository
```bash
git clone https://github.com/luis-barbara/codebay-final-project.git
```

## Set Up Environment Variables
Create a `.env` file in the root directory and configure it with the necessary settings:
```bash
POSTGRES_DB=your_database
POSTGRES_USERNAME=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=db
POSTGRES_PORT=5432
OPENAI_API_KEY=your_openai_key
DJANGO_DEBUG=True
```
Make sure to replace `yourpassword` and `your_openai_api_key` with your actual PostgreSQL password and OpenAI API key.


# Run the application:
```bash
make compose.start
make compose.migrations
make compose.migrate
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center"> <h3>💬 Questions or Suggestions?</h3> <p> <a href="https://github.com/luis-barbara/codebay-final-project/issues">Report Bug</a> • <a href="https://github.com/luis-barbara/codebay-final-project/issues">Request Feature</a> </p> </div> 







