from content.models import Novels
from rest_framework import serializers
from special.models import (SectionName,Tags,Genre,Favorite,NovelView,NewsPaper,
                            FolderItem,Folder,LastChapter,NovelRead)

class SectionNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionName
        fields = '__all__'

class TagsSerializer(serializers.ModelSerializer):
    section_name = SectionNameSerializer(read_only=True)
    class Meta:
        model = Tags
        fields = '__all__'

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Favorite
        fields = '__all__'

class NovelViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = NovelView
        fields = '__all__'

class NewsPaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsPaper
        fields = '__all__'

class FolderSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Folder
        fields = '__all__'

class FolderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolderItem
        fields = '__all__'

    def validate(self, attrs):
        folder = attrs.get('folder',getattr(self.instance ,'folder',None))

        if folder is None:
            raise attrs

        if folder.user != self.context['request'].user:
            raise serializers.ValidationError(
                {'folder': 'only owner can add item'}
            )
        return attrs

class LastChapterSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = LastChapter
        fields = '__all__'

class NovelReadSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = NovelRead
        fields = '__all__'

class SimilarNovelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Novels
        fields = [
            'id',
            'img',
            'title',
            'slug',
            'status',
            'sum_chapter',
            'author',
        ]

class HomeNovelSerializer(serializers.ModelSerializer):
    views = serializers.IntegerField(read_only=True)
    reader_count = serializers.IntegerField(read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    trend_score = serializers.FloatField(read_only=True)

    class Meta:
        model = Novels
        fields = [
            'id',
            'img',
            'title',
            'slug',
            'status',
            'org_title',
            'sum_chapter',
            'author',
            'genre',
            'tags',
            'section',
            'description',
            'views',
            'reader_count',
            'rating_count',
            'trend_score',
        ]