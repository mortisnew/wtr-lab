from django.urls import path, include
from rest_framework import routers, viewsets
from . import views
router = routers.DefaultRouter()
router.register('genre',views.GenreViewSet,basename='genre')
router.register('section',views.SectionViewSet,basename='section')
router.register('tag',views.TagViewSet,basename='tag')
router.register('recommend',views.MaybeYouLikeViewSet,basename='recommend')
router.register('similar',views.SimilairNovelViewSet,basename='similar')
router.register('folder',views.FolderViewSet,basename='Folder')
router.register('folder-item',views.FolderItemViewSet,basename='folder_item')
router.register('favorite',views.FavorViewSet,basename='favorite')
router.register('last-chapter', views.LastChapterViewSet, basename='last-chapter')
router.register('novel-read', views.NovelReadViewSet, basename='novel-read')

urlpatterns = [
    path('search/',views.SearchView.as_view(),name='search'),
    path('', include(router.urls)),
]