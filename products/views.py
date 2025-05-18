import logging
from django.shortcuts import redirect, render
from django.contrib.auth.forms import UserCreationForm
from django.views.generic import CreateView, TemplateView, FormView
from django.contrib.auth import logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages  
from characters.forms import CharacterForm  
from characters.image_service import generate_image
from characters.models import Character
from django.urls import reverse_lazy
from django.views.generic.edit import UpdateView
from django.views.generic import ListView
from django.views.generic.edit import DeleteView


logger = logging.getLogger(__name__)

# View for the homepage
class IndexView(TemplateView):
    http_method_names=["get"]
    template_name="characters/index.html"

# View for user registration
class SignupView(FormView):
    template_name = "registration/signup.html"
    success_url = "/signin"
    form_class = UserCreationForm

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

def logout_view(request):
    if request.method == "POST":
        logout(request)
        return redirect("/")

class CreateCharacterView(LoginRequiredMixin, CreateView):
    model = Character
    form_class = CharacterForm
    template_name = "characters/create_character.html"
    success_url = reverse_lazy('character-list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["object_list"] = Character.objects.filter(user=self.request.user).all()
        return context

    def form_valid(self, form):
        form.instance.user = self.request.user  # Assign the current user to the character instance
        character = form.save(commit=False)  # Save the form without committing it yet

        # Constructing the prompt dynamically based on the selected options
        prompt_parts = ["Generate a high-quality portrait of a single character with the following attributes:"]

        # Mapping all the options the user may select
        attributes = {
            "age": f"- Age: {character.age} years old" if character.age else None,
            "gender": f"- Gender: {character.get_gender_display().lower()}" if character.gender else None,
            "ethnicity": f"- Ethnicity: {character.get_ethnicity_display()}" if character.ethnicity else None,
            "skin": f"- Skin tone: {character.get_skin_display().lower()}" if character.skin else None,
            "eye_color": f"- Eye color: {character.get_eye_color_display().lower()} (must match exactly)" if character.eye_color else None,
            "hair": f"- Hair: {character.get_hair_style_display().lower()} {character.get_hair_color_display().lower()}" if character.hair_style and character.hair_color else None,
            "clothing": f"- Outfit: {character.get_clothing_display()}" if character.clothing else None,
            "clothing_style": f"- Clothing style: {character.get_clothing_style_display().lower()}" if character.clothing_style else None,
            "accessories": f"- Accessories: {character.get_accessories_display().lower()}" if character.accessories else None,
            "expression": f"- Expression: {character.get_expression_display().lower()}" if character.expression else None,
            "pose": f"- Pose: {character.get_pose_display().lower()}" if character.pose else None,
            "image_style": f"- Artistic style: {character.get_image_style_display().lower()}" if character.image_style else None,
            "image_lighting": f"- Lighting: {character.get_image_lighting_display().lower()}" if character.image_lighting else None,
            "image_shading": f"- Shading: {character.get_image_shading_display().lower()} shadows" if character.image_shading else None,
            "image_texture": f"- Texture: {character.get_image_texture_display().lower()} surfaces" if character.image_texture else None,
            "image_dominant_colors": f"- Dominant color palette: {character.get_image_dominant_colors_display().lower()}" if character.image_dominant_colors else None,
            "image_additional_details": f"- Background: {character.get_image_additional_details_display().lower()}" if character.image_additional_details else None,
            "camera": f"- Camera setup: {character.get_camera_display()} with {character.get_lens_display()}" if character.camera and character.lens else None,
            "iso": f"- ISO: {character.get_iso_display()}" if character.iso else None,
            "exposure": f"- Exposure: {character.get_exposure_display()} shutter" if character.exposure else None
        }

        # Only adding non-null attributes to the prompt
        prompt_parts.extend([desc for desc in attributes.values() if desc])

        # Adding fixed rules regarding the number of characters and other restrictions
        prompt_parts.append(""" 
        - The image must contain exactly ONE character. Do not include any other figures, silhouettes, or background characters.
        - Strictly follow the described attributes. No variations or artistic reinterpretations are allowed.
        - Ensure all elements match the given descriptions without deviations.
        """)

        prompt = "\n".join(prompt_parts)

        try:
            image_url = generate_image(prompt)  
            if image_url:
                character.image_url = image_url  
                character.save() 
                messages.success(self.request, "Character created successfully!")
                logger.info(f"Character '{character.title}' created successfully by {self.request.user.username}") 
                return self.render_to_response(self.get_context_data(form=form, new_character=character))
            else:
                messages.error(self.request, "Image generation failed. Try again.")
                logger.warning(f"Image generation failed for character '{character.title}' by {self.request.user.username}") 
                return render(self.request, self.template_name, self.get_context_data(form=form))
        except Exception as e:
            logger.error(f"Error generating image for character '{character.title}': {str(e)}")
            messages.error(self.request, f"Failed to generate image: {str(e)}")  
            return render(self.request, self.template_name, self.get_context_data(form=form))



# View to list alll characters 
class CharacterListView(LoginRequiredMixin, ListView):
    model = Character
    template_name = "characters/character_list.html"
    context_object_name = "characters"

    def get_queryset(self):
        return Character.objects.filter(user=self.request.user)

    

# View to update a character 
class CharacterUpdateView(LoginRequiredMixin, UpdateView):
    model = Character
    form_class = CharacterForm  # Usando o form corrigido
    template_name = "characters/character_update.html"
    success_url = reverse_lazy('character-list')  # O redirecionamento após salvar

    def get_queryset(self):
        return Character.objects.filter(user=self.request.user)

    def form_valid(self, form):
        form.instance.user = self.request.user  # Assign the current user to the character instance
        character = form.save(commit=False)  # Save the form without committing it yet

        # Constructing the prompt dynamically based on the selected options
        prompt_parts = ["Generate a high-quality portrait of a single character with the following attributes:"]

        # Mapping all the options the user may select
        attributes = {
            "age": f"- Age: {character.age} years old" if character.age else None,
            "gender": f"- Gender: {character.get_gender_display().lower()}" if character.gender else None,
            "ethnicity": f"- Ethnicity: {character.get_ethnicity_display()}" if character.ethnicity else None,
            "skin": f"- Skin tone: {character.get_skin_display().lower()}" if character.skin else None,
            "eye_color": f"- Eye color: {character.get_eye_color_display().lower()} (must match exactly)" if character.eye_color else None,
            "hair": f"- Hair: {character.get_hair_style_display().lower()} {character.get_hair_color_display().lower()}" if character.hair_style and character.hair_color else None,
            "clothing": f"- Outfit: {character.get_clothing_display()}" if character.clothing else None,
            "clothing_style": f"- Clothing style: {character.get_clothing_style_display().lower()}" if character.clothing_style else None,
            "accessories": f"- Accessories: {character.get_accessories_display().lower()}" if character.accessories else None,
            "expression": f"- Expression: {character.get_expression_display().lower()}" if character.expression else None,
            "pose": f"- Pose: {character.get_pose_display().lower()}" if character.pose else None,
            "image_style": f"- Artistic style: {character.get_image_style_display().lower()}" if character.image_style else None,
            "image_lighting": f"- Lighting: {character.get_image_lighting_display().lower()}" if character.image_lighting else None,
            "image_shading": f"- Shading: {character.get_image_shading_display().lower()} shadows" if character.image_shading else None,
            "image_texture": f"- Texture: {character.get_image_texture_display().lower()} surfaces" if character.image_texture else None,
            "image_dominant_colors": f"- Dominant color palette: {character.get_image_dominant_colors_display().lower()}" if character.image_dominant_colors else None,
            "image_additional_details": f"- Background: {character.get_image_additional_details_display().lower()}" if character.image_additional_details else None,
            "camera": f"- Camera setup: {character.get_camera_display()} with {character.get_lens_display()}" if character.camera and character.lens else None,
            "iso": f"- ISO: {character.get_iso_display()}" if character.iso else None,
            "exposure": f"- Exposure: {character.get_exposure_display()} shutter" if character.exposure else None
        }

        # Only adding non-null attributes to the prompt
        prompt_parts.extend([desc for desc in attributes.values() if desc])

        # Adding fixed rules regarding the number of characters and other restrictions
        prompt_parts.append(""" 
        - The image must contain exactly ONE character. Do not include any other figures, silhouettes, or background characters.
        - Strictly follow the described attributes. No variations or artistic reinterpretations are allowed.
        - Ensure all elements match the given descriptions without deviations.
        """)

        prompt = "\n".join(prompt_parts)

        try:
            image_url = generate_image(prompt)  
            if image_url:
                character.image_url = image_url  
                character.save() 
                messages.success(self.request, "Character updated successfully!")
                logger.info(f"Character '{character.title}' updated successfully by {self.request.user.username}") 
                return self.render_to_response(self.get_context_data(form=form, new_character=character))
            else:
                messages.error(self.request, "Image generation failed. Try again.")
                logger.warning(f"Image generation failed for character '{character.title}' by {self.request.user.username}")  
                return render(self.request, self.template_name, self.get_context_data(form=form))
        except Exception as e:
            logger.error(f"Error updating character '{character.title}': {str(e)}")
            messages.error(self.request, f"Failed to generate image: {str(e)}")  
            return render(self.request, self.template_name, self.get_context_data(form=form))


# View to delete a character 
class CharacterDeleteView(LoginRequiredMixin, DeleteView):
    model = Character
    template_name = "characters/character_confirm_delete.html"
    success_url = reverse_lazy("character-list")

    def get_queryset(self):
        return Character.objects.filter(user=self.request.user)
    
    def delete(self, request, *args, **kwargs):
        character = self.get_object()
        logger.warning(f"User {request.user.username} is deleting character: {character.title}")
        response = super().delete(request, *args, **kwargs)
        messages.success(request, "Character deleted successfully.")
        logger.info(f"Character '{character.title}' deleted successfully by {request.user.username}")
        return response