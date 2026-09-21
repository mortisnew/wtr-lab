from rest_framework import serializers
from content.models import Novels,Chapter,Comment,Rating
from special.serialiserz import TagsSerializer,GenreSerializer,SectionNameSerializer

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = [
            'id',
            'novel',
            'chapter_num',
            'chapter_title',
            'chapter_content',
        ]
class RatingSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Rating
        fields = '__all__'

class NovelsSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True,required=False)
    rating_log = RatingSerializer(many=True,required=False)
    average_rating = serializers.FloatField(read_only=True)
    views = serializers.IntegerField(read_only=True)
    reader_count = serializers.IntegerField(read_only=True)
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
            'chapters',
            'views',
            'reader_count',
            'trend_score',
            'rating_log',
            'average_rating',
        ]

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    novel = serializers.PrimaryKeyRelatedField(
        queryset=Novels.objects.all()
    )
    class Meta:
        model = Comment
        fields = '__all__'

class NovelDetailSerializer(serializers.ModelSerializer):
    rating_log = RatingSerializer(many=True,required=False)
    views = serializers.IntegerField(read_only=True)
    reader_count = serializers.IntegerField(read_only=True)
    trend_score = serializers.FloatField(read_only=True)
    tags = TagsSerializer(many=True, read_only=True)
    genre = GenreSerializer(many=True, read_only=True)
    section = SectionNameSerializer(many=True, read_only=True)
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
            'trend_score',
            'rating_log',
        ]
class ChapterListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = [
            'id',
            'novel',
            'chapter_num',
            'chapter_title',
        ]