import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dali.settings')
django.setup()


from characters.models import Character
import typer

app = typer.Typer()



@app.command(name="list-characters")
def list_characters():
    """List all characters in the system"""
    typer.echo("Characters in database:")
    for char in Character.objects.all():
        typer.echo(f"- {char.title} (ID: {char.id})")

@app.command(name="delete-character")
def delete_character(character_id: int):
    """Delete a character by ID"""
    try:
        char = Character.objects.get(id=character_id)
        char.delete()
        typer.echo(f"Deleted character: {char.title}")
    except Character.DoesNotExist:
        typer.echo(f"Error: Character with ID {character_id} not found", err=True)
        raise typer.Exit(1)

@app.command(name="character-stats")
def character_stats():
    """Show character generation statistics"""
    count = Character.objects.count()
    typer.echo(f"Total characters generated: {count}")
    
    if count > 0:
        latest = Character.objects.latest('date')
        typer.echo(f"Latest character: {latest.title} created on {latest.date}")

@app.command()
def runserver():
    """Run Django development server"""
    execute_from_command_line(["manage.py", "runserver"])

if __name__ == "__main__":
    app()