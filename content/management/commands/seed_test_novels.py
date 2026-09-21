import random

from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import Novels, Chapter
from special.models import Genre, Tags, SectionName


# ---------------------------------------------------------
# Test novels
# Metadata is based on novels currently visible on WTR-LAB.
# Chapter content is generated locally for testing.
# ---------------------------------------------------------

NOVELS = [
    {
        "title": "Magic School: Starting by Garnering Magical Beasts to Become a God",
        "org_title": "魔法学校：从收服魔法生物开始成神",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 357,
        "description": (
            "A test novel based on a real-world novel listing. "
            "This description is used only for local application testing."
        ),
    },
    {
        "title": "Me, a Gigolo Living in the Arms of the Zerg",
        "org_title": "我，一个生活在虫族怀抱中的男宠",
        "author": "WTR Test Author",
        "status": "completed",
        "chapters": 100,
        "description": (
            "A local test entry used to populate the novel catalogue "
            "and test completed-novel behaviour."
        ),
    },
    {
        "title": "Serious People, Who is Learning Magic at Comic Universe?",
        "org_title": "认真学习魔法的人",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 1065,
        "description": (
            "A large test novel used to test long chapter lists, "
            "detail pages and database performance."
        ),
    },
    {
        "title": "Creating America: My Campaign Manager Was Roosevelt",
        "org_title": "创造美国：我的竞选经理是罗斯福",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 1175,
        "description": (
            "A large-volume test novel for ranking, search and "
            "chapter-list performance."
        ),
    },
    {
        "title": "After I Was Forced to Become a Survival Game NPC",
        "org_title": "被迫成为生存游戏NPC之后",
        "author": "WTR Test Author",
        "status": "completed",
        "chapters": 887,
        "description": (
            "A survival-game themed test novel with many chapters."
        ),
    },
    {
        "title": "Loss of Emotional Control",
        "org_title": "情绪失控",
        "author": "WTR Test Author",
        "status": "completed",
        "chapters": 411,
        "description": (
            "A mystery and psychological test novel."
        ),
    },
    {
        "title": "Hong Kong's New Wealthy Family",
        "org_title": "香港新豪门",
        "author": "WTR Test Author",
        "status": "completed",
        "chapters": 773,
        "description": (
            "A historical and business themed test novel."
        ),
    },
    {
        "title": "Randomly Pick a Stand-in Every Day",
        "org_title": "每天随机选择一个替身",
        "author": "WTR Test Author",
        "status": "completed",
        "chapters": 878,
        "description": (
            "A test novel designed for recommendation and ranking data."
        ),
    },
    {
        "title": "From New World Pioneer to the Dragon Dynasty",
        "org_title": "从新世界开拓者到龙族王朝",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 78,
        "description": (
            "A kingdom-building fantasy test novel."
        ),
    },
    {
        "title": "My Lovely Wife Funina",
        "org_title": "我可爱的妻子芙宁娜",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 574,
        "description": (
            "A fantasy romance test novel."
        ),
    },
    {
        "title": "American Comics: My Genes Can Upgrade Indefinitely",
        "org_title": "美漫：我的基因可以无限升级",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 53,
        "description": (
            "A superhero themed test novel."
        ),
    },
    {
        "title": "Ninja World: With the Power of the Chef, We'll Win",
        "org_title": "忍界：凭借厨师之力取胜",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 90,
        "description": (
            "A ninja-world themed test novel."
        ),
    },
    {
        "title": "The Useless Designer Became a Legend",
        "org_title": "无用设计师成为传奇",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 56,
        "description": (
            "A science-fiction and entertainment themed test novel."
        ),
    },
    {
        "title": "After Moving in Together, None of the Three Roommates Seemed Quite Right",
        "org_title": "合租之后，三个室友似乎都不太对劲",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 96,
        "description": (
            "A comedy and romance themed test novel."
        ),
    },
    {
        "title": "Evil God's Self-saving Guide",
        "org_title": "邪神自救指南",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 50,
        "description": (
            "A fantasy adventure test novel."
        ),
    },
    {
        "title": "Hello Rimuru, I'm Barbatos",
        "org_title": "你好利姆鲁，我是巴巴托斯",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 56,
        "description": (
            "A fantasy reincarnation test novel."
        ),
    },
    {
        "title": "Rebirth: I am the World's Heavenly Dao",
        "org_title": "重生：我是世界天道",
        "author": "WTR Test Author",
        "status": "completed",
        "chapters": 921,
        "description": (
            "A cultivation and world-building test novel."
        ),
    },
    {
        "title": "Reborn Constantine, Forging the Byzantine Empire!",
        "org_title": "重生君士坦丁，打造拜占庭帝国",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 207,
        "description": (
            "A historical kingdom-building test novel."
        ),
    },
    {
        "title": "The Young Controller of the Last Days",
        "org_title": "末世少年掌控者",
        "author": "WTR Test Author",
        "status": "completed",
        "chapters": 1640,
        "description": (
            "A large apocalypse-themed test novel."
        ),
    },
    {
        "title": "After Straying Into the Cultivation World, I Became the Villain's Salvation",
        "org_title": "误入修真界后，我成了反派的救赎",
        "author": "WTR Test Author",
        "status": "ongoing",
        "chapters": 218,
        "description": (
            "The original test novel used during development of WebNovels."
        ),
    },
]


# ---------------------------------------------------------
# Settings
# ---------------------------------------------------------

IMAGE_URL = (
    "https://placehold.co/300x450/181818/f97316"
    "?text=WebNovels"
)


class Command(BaseCommand):
    help = "Create local WebNovels test data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--chapters",
            type=int,
            default=None,
            help=(
                "Override chapter count for every novel. "
                "Example: --chapters 20"
            ),
        )

        parser.add_argument(
            "--limit",
            type=int,
            default=20,
            help="Number of novels to create.",
        )

        parser.add_argument(
            "--delete",
            action="store_true",
            help="Delete previously generated test novels first.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        limit = options["limit"]
        chapter_override = options["chapters"]
        delete_existing = options["delete"]

        if delete_existing:
            self.stdout.write(
                self.style.WARNING(
                    "Deleting previous test novels..."
                )
            )

            titles = [novel["title"] for novel in NOVELS]

            old_novels = Novels.objects.filter(
                title__in=titles
            )

            count = old_novels.count()

            old_novels.delete()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Deleted {count} test novels."
                )
            )

        novels_to_create = NOVELS[:limit]

        genres = list(Genre.objects.all())
        tags = list(Tags.objects.all())
        sections = list(SectionName.objects.all())

        if not genres:
            self.stdout.write(
                self.style.ERROR(
                    "No genres found. Load your genres first."
                )
            )
            return

        if not tags:
            self.stdout.write(
                self.style.ERROR(
                    "No tags found. Load your tags first."
                )
            )
            return

        if not sections:
            self.stdout.write(
                self.style.ERROR(
                    "No sections found. Load your sections first."
                )
            )
            return

        created_novels = 0
        created_chapters = 0

        for data in novels_to_create:

            novel, created = Novels.objects.get_or_create(
                title=data["title"],
                defaults={
                    "img": IMAGE_URL,
                    "slug": self.make_slug(data["title"]),
                    "org_title": data["org_title"],
                    "status": data["status"],
                    "sum_chapter": (
                        chapter_override
                        if chapter_override
                        else data["chapters"]
                    ),
                    "description": data["description"],
                    "author": data["author"],
                },
            )

            if not created:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipped existing: {novel.title}"
                    )
                )
                continue

            created_novels += 1

            # ---------------------------------------------
            # Random metadata relationships
            # ---------------------------------------------

            novel.genre.set(
                random.sample(
                    genres,
                    min(3, len(genres))
                )
            )

            novel.tags.set(
                random.sample(
                    tags,
                    min(8, len(tags))
                )
            )

            novel.section.set(
                random.sample(
                    sections,
                    min(2, len(sections))
                )
            )

            # ---------------------------------------------
            # Generate chapters
            # ---------------------------------------------

            chapter_count = (
                chapter_override
                if chapter_override
                else data["chapters"]
            )

            chapters = []

            for number in range(1, chapter_count + 1):

                chapters.append(
                    Chapter(
                        novel=novel,
                        chapter_num=number,
                        chapter_title=(
                            f"Chapter {number}"
                        ),
                        chapter_content=(
                            self.generate_content(
                                novel.title,
                                number
                            )
                        ),
                    )
                )

            Chapter.objects.bulk_create(
                chapters,
                batch_size=500,
            )

            created_chapters += chapter_count

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created: {novel.title} "
                    f"({chapter_count} chapters)"
                )
            )

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(
            self.style.SUCCESS(
                f"Created novels: {created_novels}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Created chapters: {created_chapters}"
            )
        )
        self.stdout.write("=" * 60)

    @staticmethod
    def make_slug(title):
        """
        Keep the slug simple and unique enough for test data.
        """

        import re

        slug = title.lower()

        slug = re.sub(
            r"[^a-z0-9]+",
            "-",
            slug
        )

        return slug.strip("-")

    @staticmethod
    def generate_content(title, chapter_number):
        """
        Generate local dummy chapter content.

        This intentionally does NOT copy the original chapter text.
        """

        paragraphs = [
            (
                f"This is local test content for "
                f"'{title}', chapter {chapter_number}."
            ),
            (
                "The purpose of this chapter is to provide "
                "realistic text volume for testing the WebNovels "
                "reader interface."
            ),
            (
                "The application should be able to load this "
                "chapter, display the title, render multiple "
                "paragraphs and move between chapters correctly."
            ),
            (
                "This generated content can be replaced later "
                "with content that you are authorized to use."
            ),
        ]

        # Repeat the content so the reader has realistic page length.
        return "\n\n".join(
            paragraphs * 8
        )