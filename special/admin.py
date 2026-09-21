from django.contrib import admin
from .models import (NewsPaper,NovelRead,NovelView,SectionName,Genre,Tags,
                     Favorite,Folder,FolderItem,LastChapter)

admin.site.register(NewsPaper)
admin.site.register(NovelRead)
admin.site.register(NovelView)
admin.site.register(SectionName)
admin.site.register(Genre)
admin.site.register(Tags)
admin.site.register(Favorite)
admin.site.register(Folder)
admin.site.register(FolderItem)
admin.site.register(LastChapter)