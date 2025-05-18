import pytest
from django.urls import reverse
from unittest.mock import patch

# Tests if the homepage (index) loads correctly and uses the correct template.
@pytest.mark.django_db
def test_homepage(client):
    """
    This test checks if the homepage (index) loads correctly.
    It verifies that the response has a status code 200 (OK) and that the 'characters/index.html' template is used.
    """
    url = reverse('index')  
    response = client.get(url)
    
    assert response.status_code == 200
    assert 'characters/index.html' in [t.name for t in response.templates]  


# Tests if an authenticated user can access the character list page.
@pytest.mark.django_db
def test_authenticated_view(client, django_user_model):
    """
    This test simulates a user logging in and accessing the character list view.
    It checks if the response status is 200 (OK) after the user is logged in.
    """
    # Create and login a test user
    user = django_user_model.objects.create_user(username='test', password='test')
    client.force_login(user)
    
    response = client.get(reverse('character-list'))
    assert response.status_code == 200


# Fixture that provides valid character creation data for the tests.
@pytest.fixture
def valid_character_data():
    """
    This fixture provides valid data for creating a new character.
    It returns a dictionary of character attributes like title, age, gender, and other details.
    """
    return {
        'title': 'Test Character',
        'age': 25,
        'gender': 'M',
        'skin': 'LT',
        'ethnicity': 'WH',
        'eye_color': 'BL',
        'hair_color': 'BK',
        'hair_style': 'SH_WG',
        'clothing': 'LB_SJ_DJ',
        'clothing_style': 'CA',
        'accessories': 'WW_SG',
        'expression': 'SM',
        'pose': 'FF_UP',
        'image_style': 'RL',
        'image_texture': 'SM',
        'image_dominant_colors': 'NE',
        'image_contrast': 'MD',
        'image_shading': 'SO',
        'image_lighting': 'SD',
        'image_additional_details': 'NB_UR',
        'camera': 'CANON_XTi',
        'lens': '100_300mm_f5_6',
        'iso': 'ISO_200',
        'exposure': '1_160',
    }

# Tests if a new character can be created and checks if the image generation service is mocked correctly.
@pytest.mark.django_db
def test_character_creation(client, django_user_model, valid_character_data, monkeypatch):
    """
    Tests character creation with mocked image generation only
    """
    monkeypatch.setattr("characters.views.generate_image", lambda *args, **kwargs:"http://mocked.image.url")
    # Create and login user
    user = django_user_model.objects.create_user(username='test', password='test')
    client.force_login(user)

    # Make the request
    response = client.post(reverse('character-create'),data=valid_character_data,follow=True)

    # # Debugging
    # if response.status_code != 200:
    #     print(f"Status: {response.status_code}")
    #     print(response.content.decode())
    
    # if hasattr(response, 'context') and 'form' in response.context:
    #     if response.context['form'].errors:
    #         print("FORM ERRORS:", response.context['form'].errors)

    # Assertions
    assert response.status_code == 200
    from characters.models import Character
    assert Character.objects.filter(title=valid_character_data['title']).exists()
    
    