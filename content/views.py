from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from permission import OnlyAdmin,IsOwnerOrReadOnly
from .models import Novels,Chapter,Comment,Rating
from .serialiserz import (NovelsSerializer,CommentSerializer,ChapterSerializer,
                          RatingSerializer,NovelDetailSerializer,ChapterListSerializer)
from special.models import NovelView, NovelRead, LastChapter
from django.db.models import F,Count
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import action
from django.db.models import Avg

class NovelViewSet(viewsets.ModelViewSet):
    queryset = Novels.objects.all()
    serializer_class = NovelsSerializer
    permission_classes = (OnlyAdmin,)

    def get_queryset(self):
        queryset = Novels.objects.all()
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'rating_log',
                'tags',
                'genre',
                'section',
            ).annotate(
                views=Count('view_log', distinct=True),
                reader_count=Count('read_logs', distinct=True),
                rating_count=Count('rating_log', distinct=True),
                average_rating=Avg('rating_log__rating'),
            )

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return NovelDetailSerializer
        return NovelsSerializer

    def retrieve(self, request, *args, **kwargs):
        novel = self.get_object()
        ip = request.META.get('REMOTE_ADDR')

        exists = NovelView.objects.filter(
            novel=novel,
            ipaddr=ip,
            created_at__gte=timezone.now() - timedelta(minutes=30)
        ).exists()

        if not exists:
            NovelView.objects.create(
                novel=novel,
                ipaddr=ip
            )

            Novels.objects.filter(pk=novel.pk).update(
                view_count=F('view_count') + 1
            )

        return super().retrieve(request, *args, **kwargs)

class ChapterViewSet(viewsets.ModelViewSet):
    permission_classes = (OnlyAdmin,)
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    def get_serializer_class(self):
        if self.action == 'list':
            return ChapterListSerializer
        return ChapterSerializer
    def get_queryset(self):
        queryset = self.queryset.all()

        novel_id = self.request.query_params.get('novel')

        if novel_id:
            queryset = queryset.filter(novel_id=novel_id)

        return queryset.order_by('chapter_num')
    def retrieve(self, request, *args, **kwargs):
        chapter = self.get_object()

        ip = request.META.get('REMOTE_ADDR')

        if request.user.is_authenticated:
            exists = NovelRead.objects.filter(
                novel=chapter.novel,
                user=request.user,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()
        else:
            exists = NovelRead.objects.filter(
                novel=chapter.novel,
                ip_address=ip,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()

        if not exists:
            NovelRead.objects.create(
                novel=chapter.novel,
                user=request.user if request.user.is_authenticated else None,
                ip_address=ip
            )
        if request.user.is_authenticated:
            LastChapter.objects.update_or_create(
                user=request.user,
                novel=chapter.novel,
                defaults={
                    'chapter_num': chapter,
                }
            )

        return super().retrieve(request, *args, **kwargs)

class RatingViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,IsOwnerOrReadOnly)
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer

    @action(detail=False, methods=['get'])
    def check(self, request):
        novel_id = request.query_params.get('novel')

        rating = Rating.objects.filter(
            user=request.user,
            novel_id=novel_id
        ).first()

        return Response({
            "rating": rating.rating if rating else None
        })
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        novel = serializer.validated_data['novel']
        rating = serializer.validated_data.get('rating')
        existing = Rating.objects.filter(
                user=request.user,
                novel=novel,
        ).first()

        if existing:
            existing.rating = rating
            existing.save()

            return Response(
                self.get_serializer(existing).data,
                status=status.HTTP_200_OK
            )
        serializer.save(user=self.request.user)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]

        if self.action == 'create':
            return [IsAuthenticated()]

        return [IsAuthenticated(), IsOwnerOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)