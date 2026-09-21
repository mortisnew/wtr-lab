from django.contrib import admin
from .models import Novels,Rating,Comment,Chapter

admin.site.register(Novels)
admin.site.register(Rating)
admin.site.register(Comment)
admin.site.register(Chapter)
