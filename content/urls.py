from django.urls import path,include
from rest_framework import routers
from . import views


router = routers.DefaultRouter()

router.register('novels', views.NovelViewSet,basename='novels')
router.register('chapter', views.ChapterViewSet,basename='chapter')
router.register('comment', views.CommentViewSet,basename='comment')
router.register('rating', views.RatingViewSet,basename='rating')

urlpatterns = [
    path('',include(router.urls)),
]