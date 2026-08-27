from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0002_companymember'),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='registration_number',
            field=models.CharField(max_length=50, null=True, blank=True, unique=True),
        ),
    ]