from rest_framework import routers
from django.urls import path, include
from . import views


router = routers.DefaultRouter()
router.register('ranking', views.RankingViewSet,basename='ranking')
router.register('new-novels', views.NewNovelsViewSet,basename='new_novels')
router.register('trending', views.TrendingViewSet,basename='trending')
router.register('recommendation', views.RecommendationViewSet,basename='recommendation')
router.register('recent-updates', views.RecentUpdatesViewSet,basename='recent_updates')
router.register('news-paper', views.NewsPaperViewSet,basename='news_paper')

urlpatterns = [
    path('', include(router.urls)),
]
