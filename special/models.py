from django.db import models
from accounts.models import UserModel
from content.models import Novels,Chapter
from rest_framework.exceptions import ValidationError

class Genre(models.Model):
    name = models.CharField(max_length=200,unique=True)
    def __str__(self):
        return self.name

class SectionName(models.Model):
    name = models.CharField(max_length=200,unique=True)

    def __str__(self):
        return self.name

class Tags(models.Model):
    section_name = models.ForeignKey(SectionName, on_delete=models.CASCADE,related_name='tags')
    tag_name = models.CharField(max_length=200)
    def __str__(self):
        return self.tag_name


class Favorite(models.Model):
    user = models.ForeignKey(UserModel,on_delete=models.CASCADE)
    novel = models.ForeignKey(Novels, on_delete=models.CASCADE)

    def clean(self):
        if self.novel is None:
            raise ValidationError("You must select a novel")
        if self.user is None:
            raise ValidationError("login First")
    class Meta:
        unique_together = (('user','novel'),)
    def __str__(self):
        return f'{self.novel.title} | {self.user.email}'

class NovelView(models.Model):
    novel = models.ForeignKey(Novels, on_delete=models.CASCADE,related_name='view_log')
    ipaddr = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)


class LastChapter(models.Model):
    user = models.ForeignKey(UserModel,on_delete=models.CASCADE)
    novel = models.ForeignKey(Novels, on_delete=models.CASCADE,related_name='readers')
    chapter_num = models.ForeignKey(Chapter,on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('user','novel'),)


class NewsPaper(models.Model):
    user = models.ForeignKey(UserModel,on_delete=models.CASCADE)
    title = models.CharField(max_length=200,unique=True)
    content = models.TextField()
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class NovelRead(models.Model):
    novel = models.ForeignKey(
        Novels,
        on_delete=models.CASCADE,
        related_name='read_logs'
    )
    user = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Folder(models.Model):
    user = models.ForeignKey(
        UserModel,on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name
    class Meta:
        unique_together = (('user','name'),)


class FolderItem(models.Model):
    novel = models.ForeignKey(Novels, on_delete=models.CASCADE)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.novel.title

    class Meta:
        unique_together = (('folder','novel'),)
