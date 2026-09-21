from django.db.models import Count,F
from rest_framework import viewsets
import datetime
from rest_framework.permissions import AllowAny
from content.models import Novels
from content.serialiserz import  NovelsSerializer
from special.models import NewsPaper
from special.serialiserz import NewsPaperSerializer,HomeNovelSerializer

class RankingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Novels.objects.all()
    serializer_class = HomeNovelSerializer

    def get_queryset(self):
        period = self.request.query_params.get('period')

        if period == 'daily':
            start = datetime.date.today() - datetime.timedelta(days=1)
        elif period == 'weekly':
            start = datetime.date.today() - datetime.timedelta(days=7)
        elif period == 'monthly':
            start = datetime.date.today() - datetime.timedelta(days=30)
        else:
            return Novels.objects.all().order_by('-view_count')

        return Novels.objects.filter(
            view_log__created_at__gte=start
        ).annotate(
            views=Count('view_log',distinct=True)
        ).order_by('-views')


class NewNovelsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HomeNovelSerializer
    def get_queryset(self):
        return Novels.objects.all().order_by('-date_added')



class NewsPaperViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = NewsPaperSerializer

    def get_queryset(self):
        return NewsPaper.objects.all().order_by('-created_at')

class TrendingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = HomeNovelSerializer
    def get_queryset(self):
        novelsq = Novels.objects.filter(
        ).annotate(
            views=Count('view_log',distinct=True)
        ).annotate(
            reader_count=Count('read_logs',distinct=True)
        )
        novelsq = novelsq.annotate(
            trend_score=(F('views')*0.6)+(F('reader_count')*0.4)).order_by(
            '-trend_score')
        return novelsq

class RecentUpdatesViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Novels.objects.all()
    serializer_class = HomeNovelSerializer
    def get_queryset(self):
        queryset = self.queryset.all().order_by('-update_date')
        return queryset

class RecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = HomeNovelSerializer
    def get_queryset(self):
        novelsq = Novels.objects.filter(
        ).annotate(
            views=Count('view_log', distinct=True)
        ).annotate(
            reader_count=Count('read_logs', distinct=True)
        ).annotate(
            rating_count=Count('rating_log', distinct=True)
        )
        novelsq = novelsq.annotate(
            trend_score=(F('views') * 0.3) + (F('reader_count') * 0.3) + F('rating_count')* 0.4).order_by(
            '-trend_score')
        return novelsq
