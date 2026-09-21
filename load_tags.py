import json
from pathlib import Path
from urllib.request import Request, urlopen


URL = "https://wtr-lab.com/en/tags"
OUTPUT_FILE = Path("special/fixtures/tags.json")


# Your local SectionName IDs.
#
# These are the IDs we already inserted into Django.
SECTION_IDS = {
    "Protagonist Archetypes": 1,
    "Adaptations": 2,
    "Power Systems": 3,
    "Socio-Political Structures": 4,
    "Worldbuilding": 5,
    "Narrative": 6,
    "Beings & Factions": 7,
    "Relationship Tropes": 8,
    "Professional Archetypes": 9,
    "Tone & Atmosphere": 10,
    "Miscellaneous Narrative Elements": 11,
}


def download_page():
    print("=" * 60)
    print("Downloading WTR-LAB")
    print("=" * 60)

    request = Request(
        URL,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/153.0 Safari/537.36"
            )
        },
    )

    with urlopen(request, timeout=30) as response:
        html = response.read().decode(
            "utf-8",
            errors="ignore"
        )

    print(f"Downloaded: {len(html):,} bytes")

    return html


def extract_next_data(html):
    """
    Extract the __NEXT_DATA__ JSON from the WTR-LAB page.
    """

    marker_start = '<script id="__NEXT_DATA__"'

    start = html.find(marker_start)

    if start == -1:
        raise RuntimeError(
            "__NEXT_DATA__ was not found in the page."
        )

    content_start = html.find(">", start)

    if content_start == -1:
        raise RuntimeError(
            "Could not find the beginning of __NEXT_DATA__."
        )

    content_start += 1

    content_end = html.find(
        "</script>",
        content_start
    )

    if content_end == -1:
        raise RuntimeError(
            "Could not find the end of __NEXT_DATA__."
        )

    json_text = html[
        content_start:content_end
    ]

    return json.loads(json_text)


def extract_tags(data):
    """
    Extract WTR tags from:

        props
          -> pageProps
              -> tags
    """

    try:
        tags = data["props"]["pageProps"]["tags"]
    except KeyError as exc:
        raise RuntimeError(
            "Could not find props.pageProps.tags"
        ) from exc

    if not isinstance(tags, list):
        raise RuntimeError(
            "The tags data is not a list."
        )

    return tags


def validate_tags(tags):

    print()
    print("=" * 60)
    print("VALIDATION")
    print("=" * 60)

    print(f"Tags found: {len(tags)}")

    if len(tags) != 888:
        print(
            "WARNING: Expected 888 tags, "
            f"but found {len(tags)}."
        )

    # Check WTR IDs.
    ids = [tag["id"] for tag in tags]

    if len(ids) != len(set(ids)):
        raise RuntimeError(
            "Duplicate WTR tag IDs detected."
        )

    print(
        f"Unique WTR IDs: {len(set(ids))}"
    )

    # Check required fields.
    required_fields = {
        "id",
        "title",
        "category_id",
        "category_name",
    }

    for tag in tags:

        missing = required_fields - tag.keys()

        if missing:
            raise RuntimeError(
                f"Tag {tag} is missing fields: "
                f"{missing}"
            )

    print("Required fields: OK")

    # Check sections.
    categories = sorted(
        {
            tag["category_name"]
            for tag in tags
        }
    )

    print()
    print("Sections found:")

    for category in categories:

        count = sum(
            1
            for tag in tags
            if tag["category_name"] == category
        )

        print(
            f"  {category}: {count}"
        )

        if category not in SECTION_IDS:
            raise RuntimeError(
                f"Unknown SectionName: "
                f"{category}"
            )

    print()
    print(
        f"Sections: {len(categories)}"
    )


def build_fixture(tags):

    fixture = []

    for tag in tags:

        wtr_id = tag["id"]
        tag_name = tag["title"]
        section_name = tag["category_name"]

        section_id = SECTION_IDS.get(
            section_name
        )

        if section_id is None:
            raise RuntimeError(
                f"No local SectionName ID for: "
                f"{section_name}"
            )

        fixture.append(
            {
                "model": "special.tags",
                "pk": wtr_id,
                "fields": {
                    "section_name": section_id,
                    "tag_name": tag_name,
                },
            }
        )

    return fixture


def save_fixture(fixture):

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            fixture,
            file,
            ensure_ascii=False,
            indent=2
        )


def main():

    try:

        html = download_page()

        data = extract_next_data(html)

        tags = extract_tags(data)

        validate_tags(tags)

        fixture = build_fixture(tags)

        save_fixture(fixture)

        print()
        print("=" * 60)
        print("FIXTURE CREATED")
        print("=" * 60)

        print(
            f"File: {OUTPUT_FILE}"
        )

        print(
            f"Records: {len(fixture)}"
        )

        print()
        print("First 10 records:")

        for item in fixture[:10]:

            print(
                f"ID={item['pk']} | "
                f"Tag={item['fields']['tag_name']} | "
                f"Section ID="
                f"{item['fields']['section_name']}"
            )

        print()
        print("Done.")

    except Exception as exc:

        print()
        print("=" * 60)
        print("ERROR")
        print("=" * 60)

        print(exc)


if __name__ == "__main__":
    main()