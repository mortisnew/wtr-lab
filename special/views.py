from rest_framework import viewsets, status, generics, response, permissions
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from permission import IsFolderOwnerOrReadOnly, OnlyAdmin
from .models import (SectionName, Genre, Tags, Favorite, NovelView,
                     NewsPaper, Folder, FolderItem, LastChapter, NovelRead)
from .serialiserz import (GenreSerializer, SectionNameSerializer, TagsSerializer,
                          NovelViewSerializer, FavoriteSerializer, NewsPaperSerializer, FolderSerializer,
                          FolderItemSerializer, LastChapterSerializer, NovelReadSerializer,SimilarNovelSerializer)
from content.serialiserz import NovelsSerializer
from django.db.models import F, Count
from content.models import Novels
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GenreSerializer
    queryset = Genre.objects.all()

class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SectionNameSerializer
    queryset = SectionName.objects.all()

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TagsSerializer
    queryset = Tags.objects.all()


class FavorViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    queryset = Favorite.objects.all()

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)
    @action(detail=False, methods=['get'])
    def check(self,request):
        novel_id = self.request.query_params.get('novel_id')

        exists = Novels.objects.filter(user=request.user,novel_id=novel_id).exists()

        return Response({'is_favorite':exists})

class NovelViewViewSet(viewsets.ModelViewSet):
    serializer_class = NovelViewSerializer
    queryset = NovelView.objects.all()
    permission_classes = [OnlyAdmin]

class NewsPaperViewSet(viewsets.ModelViewSet):
    serializer_class = NewsPaperSerializer
    queryset = NewsPaper.objects.all()
    permission_classes = [OnlyAdmin]

class MaybeYouLikeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SimilarNovelSerializer
    def get_queryset(self):
        novel_id = self.request.query_params.get('novel_id')
        if not novel_id:
            return Novels.objects.none()

        novel = get_object_or_404(
            Novels.objects.prefetch_related(
                'genre',
                'tags',
                'section'
            ),
            pk=novel_id
        )
        genre = novel.genre.all()
        tags = novel.tags.all()
        section = novel.section.all()
        queryset = Novels.objects.filter(genre__in=genre)
        queryset = queryset.filter(section__in=section)
        queryset = queryset.filter(tags__in=tags)
        queryset = queryset.exclude(id=novel_id)
        queryset = queryset.distinct()
        queryset = queryset.order_by('?')[:5]
        return queryset



class SimilairNovelViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SimilarNovelSerializer
    def get_queryset(self):
        novel_id = self.request.query_params.get('novel_id')
        if not novel_id:
            return Novels.objects.none()
        novel = get_object_or_404(
            Novels.objects.prefetch_related(
                'genre',
                'tags',
                'section'
            ),
            pk=novel_id
        )
        genre = novel.genre.all()
        tags = novel.tags.all()
        section = novel.section.all()
        queryset = Novels.objects.filter(Q(genre__in=genre) |
                                             Q(tags__in=tags)|
                                             Q(section__in=section)).annotate(
            genres=Count('genre',
                                        filter=Q(genre__in=genre),
                                        distinct=True),
            stags=Count('tags',
                                    filter=Q(tags__in=tags)
                                    ,distinct=True),
            sections=Count('section',
                                        filter=Q(section__in=section)
                                        ,distinct=True),
            )
        queryset = queryset.distinct()
        queryset = queryset.exclude(pk=novel_id)
        queryset = queryset.annotate(
                score=F('genres')*3 + F('tags')*2 + F('sections')*1
        ).order_by('-score')

        return queryset


class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    def get_queryset(self):
        if self.action == 'list' or self.action == 'retrieve':
            return self.queryset.all()
        return self.queryset.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class FolderItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsFolderOwnerOrReadOnly]
    queryset = FolderItem.objects.all()
    serializer_class = FolderItemSerializer

    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            return self.queryset.all()

        return self.queryset.filter(folder__user=self.request.user)


class SearchView(APIView):
    def get(self, request):
        q = request.query_params.get('q', '')

        if not q:
            return Response(
                {'error': 'q parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        novels = Novels.objects.filter(title__icontains=q)

        content_list = []

        for item in novels:
            content_list.append({
                'id':item.pk,
                'title': item.title,
                'img': item.img
            })

        return Response(content_list)

class LastChapterViewSet(viewsets.ModelViewSet):
    serializer_class = LastChapterSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return LastChapter.objects.none()

        return LastChapter.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NovelReadViewSet(viewsets.ModelViewSet):
    serializer_class = NovelReadSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return NovelRead.objects.none()

        return NovelRead.objects.filter(
            user=self.request.user
        )