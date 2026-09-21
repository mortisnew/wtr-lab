
from django.core.validators import MinValueValidator,MaxValueValidator
from django.db import models
from accounts.models import UserModel


class StatusChoices(models.TextChoices):
    ONGOING = 'ongoing'
    COMPLETED = 'completed'
    HIATUS = 'hiatus'
    DROPPED = 'dropped'

class Novels(models.Model):
    img = models.URLField()
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    view_count = models.IntegerField(default=0)
    org_title = models.CharField(max_length=200)
    status = models.CharField(choices=StatusChoices.choices,
                              max_length=10,
                              default=StatusChoices.ONGOING)
    sum_chapter = models.IntegerField()
    description = models.TextField()
    date_added = models.DateField(auto_now_add=True)
    update_date = models.DateField(auto_now=True)
    author = models.CharField(max_length=200)
    genre = models.ManyToManyField('special.Genre', blank=True,related_name='genres')
    tags = models.ManyToManyField('special.Tags', blank=True, related_name='tags')
    section = models.ManyToManyField('special.SectionName', blank=True, related_name='sections')
    def __str__(self):
        return self.title

class Chapter(models.Model):
    novel = models.ForeignKey(Novels, on_delete=models.CASCADE,related_name='chapters')
    chapter_num = models.IntegerField()
    chapter_title = models.CharField(max_length=200,blank=True, null=True)
    chapter_content = models.TextField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['novel', 'chapter_num'],
                name='unique_chapter'
            )
        ]

    def __str__(self):
        return f'{self.chapter_num} - {self.chapter_title}'

class Comment(models.Model):
    user = models.ForeignKey(UserModel,on_delete=models.CASCADE)
    novel = models.ForeignKey(Novels, on_delete=models.CASCADE)
    comment = models.TextField()

class Rating(models.Model):
    user = models.ForeignKey(UserModel,on_delete=models.CASCADE)
    novel = models.ForeignKey(Novels, on_delete=models.CASCADE,related_name='rating_log')
    rating = models.IntegerField(validators=[MinValueValidator(1),MaxValueValidator(5)])

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'novel'],
                name='unique_rating'
            )
        ]
    def __str__(self):
        return f'{self.user} - {self.novel} - {self.rating}'