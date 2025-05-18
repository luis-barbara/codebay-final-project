import logging
from django.utils.timezone import now
from django.db import models
from django.contrib.auth import get_user_model


# Create your models here.

logger = logging.getLogger(__name__)

# Defining choices

# 1. Basic Choices for Character Attributes
GENDER_CHOICES = [
    ("", "No selection"),
    ("M", "Male"),
    ("F", "Female"),
]

SKIN_CHOICES = [
    ("", "No selection"),
    ("LT", "Light"),
    ("MD", "Medium"),
    ("DR", "Dark"),
    ("VL", "Very Light"),
    ("VD", "Very Dark"),
    ("OL", "Olive"),
]

ETHNICITY_CHOICES = [
    ("", "No selection"),
    ("WH", "White"),
    ("BL", "Black"),
    ("LA", "Latino/Hispanic"),
    ("EA", "East Asian"),
    ("SA", "South Asian"),
    ("ME", "Middle Eastern"),
    ("IN", "Indigenous"),
]

EYE_COLOR_CHOICES = [
    ("", "No selection"),
    ("BR", "Brown"),
    ("BL", "Blue"),
    ("GR", "Green"),
    ("HA", "Hazel"),
    ("AM", "Amber"),
    ("GY", "Gray"),
    ("VI", "Violet"),
]

HAIR_COLOR_CHOICES = [
    ("", "No selection"),
    ("BK", "Black"),
    ("BR", "Brown"),
    ("BL", "Blonde"),
    ("RD", "Red"),
    ("GY", "Gray"),
    ("WH", "White"),
    ("AU", "Auburn"),
    ("BU", "Blue"),
    ("GR", "Green"),
    ("PU", "Purple"),
    ("PI", "Pink"),
    ("SI", "Silver"),
]

HAIR_STYLE_CHOICES = [
    ("", "No selection"),
    ("SH_WG", "Short and Well-Groomed"),
    ("SH_UN", "Short and Unkempt"),
    ("MD_WG", "Medium and Well-Groomed"),
    ("MD_UN", "Medium and Unkempt"),
    ("LN_WG", "Long and Well-Groomed"),
    ("LN_UN", "Long and Unkempt"),
    ("CU_WG", "Curly and Well-Groomed"),
    ("CU_UN", "Curly and Unkempt"),
    ("ST_WG", "Straight and Well-Groomed"),
    ("ST_UN", "Straight and Unkempt"),
    ("WI_WG", "Wavy and Well-Groomed"),
    ("WI_UN", "Wavy and Unkempt"),
    ("BU_WG", "Buzz Cut and Well-Groomed"),
    ("BU_UN", "Buzz Cut and Unkempt"),
    ("AF_WG", "Afro and Well-Groomed"),
    ("AF_UN", "Afro and Unkempt"),
    ("MO_WG", "Mullet and Well-Groomed"),
    ("MO_UN", "Mullet and Unkempt"),
]

CLOTHING_CHOICES = [
    ("", "No selection"),
    ("LB_SJ_DJ", "Light Blue Shirt and Dark Jeans"),
    ("WB_SJ_LJ", "White Button-up Shirt and Light Jeans"),
    ("BL_SJ_DJ", "Black Shirt and Dark Jeans"),
    ("GR_T_SH_LJ", "Gray T-shirt and Light Jeans"),
    ("RD_SJ_BJ", "Red Shirt and Black Jeans"),
    ("BL_T_SH_DJ", "Blue T-shirt and Dark Jeans"),
    ("GR_HO_LJ", "Gray Hoodie and Light Jeans"),
    ("BL_HO_DJ", "Black Hoodie and Dark Jeans"),
    ("WH_DRS_LJ", "White Dress and Light Jeans"),
    ("FL_JKT_DJ", "Flannel Jacket and Dark Jeans"),
    ("WI_T_SH_LJ", "White T-shirt and Light Jeans"),
    ("GR_HO_BJ", "Gray Hoodie and Black Jeans"),
    ("NV_SJ_LJ", "Navy Shirt and Light Jeans"),
    ("BL_CJ_BJ", "Black Cardigan and Black Jeans"),
    ("RD_T_SH_LJ", "Red T-shirt and Light Jeans"),
]

CLOTHING_STYLE_CHOICES = [
    ("", "No selection"),
    ("CA", "Casual"),
    ("FO", "Formal"),
    ("SP", "Sporty"),
    ("BU", "Business"),
    ("ST", "Streetwear"),
    ("BO", "Bohemian"),
    ("GO", "Gothic"),
    ("VI", "Vintage"),
    ("PU", "Punk"),
    ("EL", "Elegant"),
]

EXPRESSION_CHOICES = [
    ("", "No selection"),
    ("CF", "Confident"),
    ("SM", "Smiling"),
    ("SO", "Serious"),
    ("AN", "Angry"),
    ("SA", "Sad"),
    ("NE", "Neutral"),
    ("FR", "Frightened"),
    ("EX", "Excited"),
    ("SU", "Surprised"),
    ("DI", "Disappointed"),
]

POSE_CHOICES = [
    ("", "No selection"),
    ("FF_UP", "Facing Forward, Upright Posture"),
    ("FF_SL", "Facing Forward, Slight Lean"),
    ("SI", "Sitting"),
    ("ST", "Standing"),
    ("ST_RL", "Standing, Relaxed"),
    ("ST_HS", "Standing, Hands in Pockets"),
    ("LF", "Leaning Forward"),
    ("BF", "Bent Forward"),
    ("LS", "Leaning Sideways"),
    ("RF", "Reclining Forward"),
    ("BF_AR", "Bent Forward, Arms Resting"),
    ("TF", "Tightened Frame, Body Forward"),
]

ACCESSORIES_CHOICES = [
    ("", "No selection"),
    ("WW_SG", "Wristwatch and Sunglasses"),
    ("HT_SG", "Hat and Sunglasses"),
    ("BR_WW", "Bracelet and Wristwatch"),
    ("EA_RNG", "Earrings and Ring"),
    ("WW_HT", "Wristwatch and Hat"),
    ("SC_WW", "Scarf and Wristwatch"),
    ("SG_BG", "Sunglasses and Bag"),
    ("TP_BU", "Tie and Belt"),
    ("BR_SC", "Bracelet and Scarf"),
    ("NC_WW", "Necklace and Wristwatch"),
    ("WW_EA", "Wristwatch and Earrings"),
    ("SG_EA", "Sunglasses and Earrings"),
    ("WW_BA", "Wristwatch and Bracelet"),
]


# 2. Image Style Settings Choices
IMAGE_STYLE_CHOICES = [
    ("", "No selection"),
    ("RL", "Photorealistic"),
    ("CT", "Cartoon"),
    ("AB", "Abstract"),
    ("PA", "Painting"),
    ("3D", "3D Render"),
    ("AN", "Anime"),
    ("SK", "Sketch"),
    ("CG", "Concept Art"),
    ("IM", "Illustration"),
    ("SG", "Studio Ghibli"),
    ("DS", "Disney Animation"),
    ("PX", "Pixar"),
    ("WB", "Warner Bros Animation"),
]

IMAGE_TEXTURE_CHOICES = [
    ("", "No selection"),
    ("SM", "Smooth"),
    ("RF", "Rough"),
    ("GR", "Grainy"),
]

IMAGE_DOMINANT_COLORS_CHOICES = [
    ("", "No selection"),
    ("NE", "Neutral"),
    ("RD", "Red"),
    ("BL", "Blue"),
    ("GR", "Green"),
    ("YL", "Yellow"),
    ("OR", "Orange"),
    ("PK", "Pink"),
    ("WT", "White"),
    ("BK", "Black"),
    ("GRD", "Gradient"),
    ("VIO", "Violet"),
    ("BRN", "Brown"),
    ("BE", "Beige"),
    ("CR", "Cream"),
    ("IV", "Ivory"),
]

IMAGE_CONTRAST_CHOICES = [
    ("", "No selection"),
    ("VH", "Very High"),
    ("HI", "High"),
    ("MD", "Moderate"),
    ("LO", "Low"),
    ("VL", "Very Low"),
    ("NO", "None"),
]

IMAGE_SHADING_CHOICES = [
    ("", "No selection"),
    ("SO", "Soft"),
    ("MO", "Moderate"),
    ("HR", "Harsh"),
    ("DR", "Dramatic"),
    ("NO", "None"),
]

# 3. Image Effects (Lighting and Additional Details)
IMAGE_LIGHTING_CHOICES = [
    ("", "No selection"),
    ("SD", "Soft and Diffuse"),
    ("HR", "Harsh"),
    ("DR", "Dramatic"),
    ("NT", "Natural"),
    ("BC", "Backlit"),
    ("CL", "Cinematic"),
    ("MG", "Moody and Gloomy"),
    ("GD", "Golden Hour"),
    ("BL", "Blue Hour"),
    ("NE", "Neon Glow"),
]

IMAGE_ADDITIONAL_DETAILS_CHOICES = [
    ("", "No selection"),
    ("NB_UR", "No Background, Ultra-realistic"),
    ("BG_NM", "Background, Night Mode"),
    ("BG_SF", "Background, Soft Focus"),
    ("NB_DR", "No Background, Dramatic Lighting"),
    ("BG_HD", "Background, High Definition"),
    ("NB_LD", "No Background, Low Detail"),
    ("BG_VS", "Background, Vintage Style"),
    ("NB_PS", "No Background, Pseudo-realistic"),
    ("BG_SV", "Background, Sepia Vibe"),
    ("NB_SF", "No Background, Soft Focus"),
    ("BG_CE", "Background, Cinematic Effect"),
]

# 5. Photography Technical Options
CAMERA_CHOICES = [
    ("", "No selection"),
    ("CANON_XTi", "Canon EOS Digital Rebel XTi"),
    ("NIKON_D810", "Nikon D810"),
    ("CANON_1000D", "Canon EOS 1000D"),
]

LENS_CHOICES = [
    ("", "No selection"),
    ("100_300mm_f5_6", "100-300mm Canon f/5.6"),
    ("18mm_f3_5", "18mm Canon f/3.5"),
    ("85mm_f2_5", "85mm f/2.5"),
]

ISO_CHOICES = [
    ("", "No selection"),
    ("ISO_64", "ISO 64"),
    ("ISO_200", "ISO 200"),
    ("ISO_400", "ISO 400"),
]

EXPOSURE_CHOICES = [
    ("", "No selection"),
    ("1_160", "1/160"),
    ("1_5", "1/5"),
    ("1_800", "1/800"),
]


# Character Model
class Character(models.Model):
    id = models.BigAutoField(primary_key=True)  

    # Basic Information
    title = models.CharField(max_length=255)  
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES,default=GENDER_CHOICES[0][0]) 
    age = models.PositiveIntegerField()  
    skin = models.CharField(max_length=10,choices=SKIN_CHOICES,default=SKIN_CHOICES[0][0])
    ethnicity = models.CharField(max_length=10, choices=ETHNICITY_CHOICES,default=ETHNICITY_CHOICES[0][0])  

    # Physical Attributes
    eye_color = models.CharField(max_length=10, choices=EYE_COLOR_CHOICES,default=EYE_COLOR_CHOICES[0][0])
    hair_color = models.CharField(max_length=10, choices=HAIR_COLOR_CHOICES,default=HAIR_COLOR_CHOICES[0][0])
    hair_style = models.CharField(max_length=10, choices=HAIR_STYLE_CHOICES,default=HAIR_STYLE_CHOICES[0][0])

    # Clothing and Accessories
    clothing = models.CharField(max_length=10,  choices=CLOTHING_CHOICES,default=CLOTHING_CHOICES[0][0]) 
    clothing_style = models.CharField(max_length=10, choices=CLOTHING_STYLE_CHOICES,default=CLOTHING_STYLE_CHOICES[0][0])
    accessories = models.CharField(max_length=10, choices=ACCESSORIES_CHOICES,default=ACCESSORIES_CHOICES[0][0])

    # Expression and Pose
    expression = models.CharField(max_length=10, choices=EXPRESSION_CHOICES,default=EXPRESSION_CHOICES[0][0]) 
    pose = models.CharField(max_length=10, choices=POSE_CHOICES,default=POSE_CHOICES[0][0]) 

    # Image Style Settings
    image_style = models.CharField(max_length=10, choices=IMAGE_STYLE_CHOICES,default=IMAGE_STYLE_CHOICES[0][0])
    image_texture = models.CharField(max_length=10, choices=IMAGE_TEXTURE_CHOICES,default=IMAGE_TEXTURE_CHOICES[0][0])
    image_dominant_colors = models.CharField(max_length=10, choices=IMAGE_DOMINANT_COLORS_CHOICES,default=IMAGE_DOMINANT_COLORS_CHOICES[0][0]) 
    image_contrast = models.CharField(max_length=10, choices=IMAGE_CONTRAST_CHOICES,default=IMAGE_CONTRAST_CHOICES[0][0])
    image_shading = models.CharField(max_length=10, choices=IMAGE_SHADING_CHOICES,default=IMAGE_SHADING_CHOICES[0][0])

    # Image Details
    image_lighting = models.CharField(max_length=10, choices=IMAGE_LIGHTING_CHOICES,default=IMAGE_LIGHTING_CHOICES[0][0])
    image_additional_details = models.CharField(max_length=10, choices=IMAGE_ADDITIONAL_DETAILS_CHOICES,default=IMAGE_ADDITIONAL_DETAILS_CHOICES[0][0]) 

    # Opções de Fotografia
    camera = models.CharField(max_length=20, choices=CAMERA_CHOICES,default=CAMERA_CHOICES[0][0])
    lens = models.CharField(max_length=20, choices=LENS_CHOICES,default=LENS_CHOICES[0][0])
    iso = models.CharField(max_length=10, choices=ISO_CHOICES,default=ISO_CHOICES[0][0])
    exposure = models.CharField(max_length=10, choices=EXPOSURE_CHOICES,default=EXPOSURE_CHOICES[0][0])


    user = models.ForeignKey(get_user_model(), on_delete=models.DO_NOTHING, null=True)
    image_url = models.URLField(max_length=1024, blank=True, null=True)
    date = models.DateTimeField(default=now, blank=True)


    class Meta:
        db_table = "characters" 
        verbose_name = "Character"
        verbose_name_plural = "Characters"

    def __str__(self):
        return self.title


    def save(self, *args, **kwargs):
        if self.pk:
            logger.info(f"Character '{self.title}' updated by {self.user.username if self.user else 'Unknown User'}.")
        else:
            logger.info(f"New character '{self.title}' created by {self.user.username if self.user else 'Unknown User'}.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        logger.warning(f"Character '{self.title}' deleted by {self.user.username if self.user else 'Unknown User'}.")
        super().delete(*args, **kwargs)








