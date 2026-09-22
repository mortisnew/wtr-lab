import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NovelCard from '../components/NovelCard'
import {
  getNovel,
  getFolders,
  getFolderItems,
  createFolderItem,
  getComments,
  createComment,
  getChapters,
  getSimilarNovels,
  getRecommendedNovels,
  getFavorites,
  createFavorite,
  deleteFavorite,
  getRatings,
  createRating,
  updateRating,
  getProfile,
} from '../services/api'

type Chapter = {
  id: number
  novel: number
  chapter_num: number
  chapter_title: string | null
}

type Genre = {
  id: number
  name: string
}

type Section = {
  id: number
  name: string
}

type Tag = {
  id: number
  tag_name: string
  section_name: Section
}

type Novel = {
  id: number
  title: string
  img: string
  slug: string
  status: string
  org_title: string
  sum_chapter: number
  author: string
  description: string
  views?: number
  reader_count?: number
  trend_score?: number
  average_rating: number | null
  genre: Genre[]
  tags: Tag[]
  section: Section[]
}

type Rating = {
  id: number
  user: number
  novel: number
  rating: number
}

type Favorite = {
  id: number
  user: number
  novel: number
}

type Folder = {
  id: number
  user: number
  name: string
}

type FolderItem = {
  id: number
  novel: number
  folder: number
}

type Comment = {
  id: number
  user: number
  novel: number
  comment: string
}

type Tab =
  | 'about'
  | 'chapters'
  | 'reviews'
  | 'community'

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[]
  }

  if (
    data &&
    typeof data === 'object' &&
    'results' in data
  ) {
    const results = (data as { results?: unknown }).results

    return Array.isArray(results)
      ? (results as T[])
      : []
  }

  return []
}

function NovelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [novel, setNovel] = useState<Novel | null>(null)

  const [similarNovels, setSimilarNovels] = useState<Novel[]>([])
  const [recommendedNovels, setRecommendedNovels] = useState<Novel[]>([])

  const [folders, setFolders] = useState<Folder[]>([])
  const [folderItems, setFolderItems] = useState<FolderItem[]>([])
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [folderAdding, setFolderAdding] = useState(false)
  const [foldersLoading, setFoldersLoading] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])

  const [activeTab, setActiveTab] = useState<Tab>('about')

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(false)

  const [loadingChapterGroups, setLoadingChapterGroups] = useState<number[]>([])
  const [loadedChapterGroups, setLoadedChapterGroups] = useState<number[]>([])
  const [openChapterGroups, setOpenChapterGroups] = useState<number[]>([])

  const [chapterCount, setChapterCount] = useState(0)
  const [chapterPageSize, setChapterPageSize] = useState(0)
  const [loadedChapterPages, setLoadedChapterPages] = useState<number[]>([])

  const [loading, setLoading] = useState(true)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [communityLoading, setCommunityLoading] = useState(false)

  const [favoriteId, setFavoriteId] = useState<number | null>(null)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const [userId, setUserId] = useState<number | null>(null)

  const [selectedRating, setSelectedRating] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')

  /*
   * Novel Detail
   */
  useEffect(() => {
    if (!id) {
      return
    }

    const novelId = Number(id)

    if (!Number.isFinite(novelId)) {
      setNovel(null)
      setLoading(false)
      return
    }

    setLoading(true)

    getNovel(novelId)
      .then((novelData) => {
        setNovel(novelData)
      })
      .catch((error) => {
        console.error('NOVEL DETAIL ERROR:', error)
        setNovel(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  /*
   * Current user
   */
  useEffect(() => {
    const access = localStorage.getItem('access')

    if (!access) {
      setUserId(null)
      return
    }

    getProfile()
      .then((data) => {
        const user = Array.isArray(data)
          ? data[0]
          : data?.results?.[0] ?? data

        setUserId(user?.id ?? null)
      })
      .catch(() => {
        setUserId(null)
      })
  }, [])

  /*
   * Load ONLY first chapter page.
   *
   * We intentionally do not load all pagination here.
   */
  useEffect(() => {
    if (!novel || activeTab !== 'chapters') {
      return
    }

    let cancelled = false

    const loadFirstChapterPage = async () => {
      setChaptersLoading(true)

      try {
        const data = await getChapters(novel.id, 1)

        if (cancelled) {
          return
        }

        const results = asArray<Chapter>(data)

        const count =
          typeof data === 'object' &&
          data !== null &&
          'count' in data &&
          typeof data.count === 'number'
            ? data.count
            : results.length

        setChapters(results)
        setChapterCount(count)
        setChapterPageSize(results.length)

        if (results.length > 0) {
          setLoadedChapterPages([1])
        } else {
          setLoadedChapterPages([])
        }

        setLoadedChapterGroups([])
        setOpenChapterGroups([])
      } catch (error) {
        if (!cancelled) {
          console.error(
            'FIRST CHAPTER PAGE ERROR:',
            error
          )

          setChapters([])
          setChapterCount(0)
          setChapterPageSize(0)
          setLoadedChapterPages([])
          setLoadedChapterGroups([])
          setOpenChapterGroups([])
        }
      } finally {
        if (!cancelled) {
          setChaptersLoading(false)
        }
      }
    }

    loadFirstChapterPage()

    return () => {
      cancelled = true
    }
  }, [novel, activeTab])

  /*
   * Similar + Maybe You Like
   */
  useEffect(() => {
    if (!novel) {
      return
    }

    let cancelled = false

    setRecommendationsLoading(true)

    Promise.all([
      getSimilarNovels(novel.id),
      getRecommendedNovels(novel.id),
    ])
      .then(
        ([
          similarData,
          recommendedData,
        ]) => {
          if (cancelled) {
            return
          }

          setSimilarNovels(
            asArray<Novel>(similarData)
          )

          setRecommendedNovels(
            asArray<Novel>(recommendedData)
          )
        }
      )
      .catch((error) => {
        if (cancelled) {
          return
        }

        console.error(
          'RECOMMENDATIONS ERROR:',
          error
        )

        setSimilarNovels([])
        setRecommendedNovels([])
      })
      .finally(() => {
        if (!cancelled) {
          setRecommendationsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [novel])

  /*
   * Favorites
   */
  useEffect(() => {
    if (!novel) {
      return
    }

    const access =
      localStorage.getItem('access')

    if (!access) {
      setFavoriteId(null)
      return
    }

    getFavorites()
      .then((data) => {
        const favoritesList =
          asArray<Favorite>(data)

        const favorite =
          favoritesList.find(
            (item) =>
              item.novel === novel.id
          )

        setFavoriteId(
          favorite?.id ?? null
        )
      })
      .catch((error) => {
        console.error(
          'FAVORITES ERROR:',
          error
        )

        setFavoriteId(null)
      })
  }, [novel])

  /*
   * Ratings
   */
  useEffect(() => {
    if (!novel) {
      return
    }

    getRatings()
      .then((data) => {
        const allRatings =
          asArray<Rating>(data)

        const novelRatings =
          allRatings.filter(
            (rating) =>
              rating.novel === novel.id
          )

        setRatings(novelRatings)

        if (userId !== null) {
          const ownRatingItem =
            novelRatings.find(
              (rating) =>
                rating.user === userId
            )

          setSelectedRating(
            ownRatingItem?.rating ?? 0
          )
        } else {
          setSelectedRating(0)
        }
      })
      .catch((error) => {
        console.error(
          'RATINGS ERROR:',
          error
        )

        setRatings([])
        setSelectedRating(0)
      })
  }, [novel, userId])

  /*
   * Reviews
   */
  useEffect(() => {
    if (
      activeTab !== 'reviews' ||
      !novel
    ) {
      return
    }

    let cancelled = false

    setReviewsLoading(true)
    setCommentsError('')

    getComments()
      .then((data) => {
        if (cancelled) {
          return
        }

        const allComments =
          asArray<Comment>(data)

        setComments(
          allComments.filter(
            (comment) =>
              comment.novel === novel.id
          )
        )
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        console.error(
          'COMMENTS ERROR:',
          error
        )

        if (
          error instanceof Error &&
          error.message.includes('401')
        ) {
          setCommentsError(
            'You need to log in to view and post reviews.'
          )
        } else {
          setCommentsError(
            'Could not load reviews.'
          )
        }

        setComments([])
      })
      .finally(() => {
        if (!cancelled) {
          setReviewsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeTab, novel])

  /*
   * Community
   */
  useEffect(() => {
    if (
      activeTab !== 'community' ||
      !novel
    ) {
      return
    }

    let cancelled = false

    setCommunityLoading(true)

    Promise.all([
      getFolders(),
      getFolderItems(),
    ])
      .then(
        ([
          foldersData,
          folderItemsData,
        ]) => {
          if (cancelled) {
            return
          }

          setFolders(
            asArray<Folder>(foldersData)
          )

          setFolderItems(
            asArray<FolderItem>(
              folderItemsData
            ).filter(
              (item) =>
                item.novel === novel.id
            )
          )
        }
      )
      .catch((error) => {
        if (cancelled) {
          return
        }

        console.error(
          'COMMUNITY ERROR:',
          error
        )

        setFolders([])
        setFolderItems([])
      })
      .finally(() => {
        if (!cancelled) {
          setCommunityLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeTab, novel])

  /*
   * Derived data
   */
  const ownRating = useMemo(() => {
    if (userId === null) {
      return null
    }

    return (
      ratings.find(
        (rating) =>
          rating.user === userId
      ) ?? null
    )
  }, [ratings, userId])

  const novelFolderItems = useMemo(() => {
    if (!novel) {
      return []
    }

    return folderItems.filter(
      (item) =>
        item.novel === novel.id
    )
  }, [folderItems, novel])

  const novelFolders = useMemo(() => {
    return novelFolderItems
      .map((item) =>
        folders.find(
          (folder) =>
            folder.id === item.folder
        )
      )
      .filter(
        (
          folder
        ): folder is Folder =>
          Boolean(folder)
      )
  }, [folders, novelFolderItems])

  /*
   * Chapter groups.
   *
   * Groups are created from the total chapter count,
   * not only from chapters already downloaded.
   */
  const chapterGroups = useMemo(() => {
    const total =
      chapterCount ||
      novel?.sum_chapter ||
      0

    const totalGroups =
      Math.ceil(total / 100)

    const groups: Array<
      [number, Chapter[]]
    > = []

    for (
      let group = 0;
      group < totalGroups;
      group++
    ) {
      const groupChapters =
        chapters.filter((chapter) => {
          const chapterGroup =
            Math.floor(
              (chapter.chapter_num - 1) /
                100
            )

          return chapterGroup === group
        })

      groups.push([
        group,
        groupChapters,
      ])
    }

    return groups
  }, [
    chapterCount,
    chapters,
    novel?.sum_chapter,
  ])

  const views =
    novel?.views ?? 0

  const readers =
    novel?.reader_count ?? 0

  const averageRating =
    novel?.average_rating ?? null

  /*
   * Load the pages needed for ONE chapter group.
   *
   * Example:
   * page size = 12
   * group 0 = chapters 1-100
   * pages needed = 1 through 9
   *
   * Already loaded pages are skipped.
   */
  const loadChapterGroup = async (
    group: number
  ) => {
    if (
      !novel ||
      chapterPageSize <= 0
    ) {
      return
    }

    if (
      loadedChapterGroups.includes(group) ||
      loadingChapterGroups.includes(group)
    ) {
      return
    }

    const firstChapter =
      group * 100 + 1

    const lastChapter =
      Math.min(
        (group + 1) * 100,
        chapterCount ||
          novel.sum_chapter
      )

    const firstPage =
      Math.floor(
        (firstChapter - 1) /
          chapterPageSize
      ) + 1

    const lastPage =
      Math.floor(
        (lastChapter - 1) /
          chapterPageSize
      ) + 1

    const pagesToLoad: number[] = []

    for (
      let page = firstPage;
      page <= lastPage;
      page++
    ) {
      if (
        !loadedChapterPages.includes(
          page
        )
      ) {
        pagesToLoad.push(page)
      }
    }

    if (pagesToLoad.length === 0) {
      setLoadedChapterGroups(
        (current) =>
          current.includes(group)
            ? current
            : [
                ...current,
                group,
              ]
      )

      return
    }

    setLoadingChapterGroups(
      (current) => [
        ...current,
        group,
      ]
    )

    try {
      const responses =
        await Promise.all(
          pagesToLoad.map(
            (page) =>
              getChapters(
                novel.id,
                page
              )
          )
        )

      const newChapters =
        responses.flatMap(
          (data) =>
            asArray<Chapter>(data)
        )

      setChapters((current) => {
        const chapterMap =
          new Map<
            number,
            Chapter
          >()

        current.forEach(
          (chapter) => {
            chapterMap.set(
              chapter.id,
              chapter
            )
          }
        )

        newChapters.forEach(
          (chapter) => {
            chapterMap.set(
              chapter.id,
              chapter
            )
          }
        )

        return Array.from(
          chapterMap.values()
        ).sort(
          (a, b) =>
            a.chapter_num -
            b.chapter_num
        )
      })

      setLoadedChapterPages(
        (current) => {
          const merged = new Set([
            ...current,
            ...pagesToLoad,
          ])

          return Array.from(
            merged
          ).sort(
            (a, b) => a - b
          )
        }
      )

      setLoadedChapterGroups(
        (current) =>
          current.includes(group)
            ? current
            : [
                ...current,
                group,
              ]
      )
    } catch (error) {
      console.error(
        'CHAPTER GROUP ERROR:',
        error
      )
    } finally {
      setLoadingChapterGroups(
        (current) =>
          current.filter(
            (item) =>
              item !== group
          )
      )
    }
  }

  /*
   * Actions
   */
  const openFolderModal = async () => {
    if (!novel) {
      return
    }

    const access =
      localStorage.getItem('access')

    if (!access) {
      navigate('/login')
      return
    }

    setShowFolderModal(true)
    setFoldersLoading(true)

    try {
      const [
        foldersData,
        folderItemsData,
      ] = await Promise.all([
        getFolders(),
        getFolderItems(),
      ])

      setFolders(
        asArray<Folder>(foldersData)
      )

      setFolderItems(
        asArray<FolderItem>(
          folderItemsData
        ).filter(
          (item) =>
            item.novel === novel.id
        )
      )
    } catch (error) {
      console.error(
        'LOAD FOLDERS ERROR:',
        error
      )

      setFolders([])
      setFolderItems([])
    } finally {
      setFoldersLoading(false)
    }
  }

  const addToFolder = async (
    folderId: number
  ) => {
    if (
      !novel ||
      folderAdding
    ) {
      return
    }

    const alreadyExists =
      folderItems.some(
        (item) =>
          item.folder === folderId &&
          item.novel === novel.id
      )

    if (alreadyExists) {
      return
    }

    try {
      setFolderAdding(true)

      const newItem =
        await createFolderItem({
          folder: folderId,
          novel: novel.id,
        })

      setFolderItems(
        (current) => [
          ...current,
          newItem,
        ]
      )

      setShowFolderModal(false)
    } catch (error) {
      console.error(
        'ADD TO FOLDER ERROR:',
        error
      )
    } finally {
      setFolderAdding(false)
    }
  }

  const handleFavorite =
    async () => {
      if (
        !novel ||
        favoriteLoading
      ) {
        return
      }

      const access =
        localStorage.getItem(
          'access'
        )

      if (!access) {
        navigate('/login')
        return
      }

      setFavoriteLoading(true)

      try {
        if (favoriteId !== null) {
          await deleteFavorite(
            favoriteId
          )

          setFavoriteId(null)
        } else {
          const favorite =
            await createFavorite(
              novel.id
            )

          setFavoriteId(
            favorite.id
          )
        }
      } catch (error) {
        console.error(
          'FAVORITE ERROR:',
          error
        )
      } finally {
        setFavoriteLoading(false)
      }
    }

  const handleRating =
    async (
      ratingValue: number
    ) => {
      if (
        !novel ||
        ratingLoading
      ) {
        return
      }

      const access =
        localStorage.getItem(
          'access'
        )

      if (!access) {
        navigate('/login')
        return
      }

      setRatingLoading(true)

      try {
        if (ownRating) {
          const updated =
            await updateRating(
              ownRating.id,
              {
                rating: ratingValue,
              }
            )

          setRatings(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  ownRating.id
                    ? updated
                    : item
              )
          )
        } else {
          const created =
            await createRating({
              novel: novel.id,
              rating: ratingValue,
            })

          setRatings(
            (current) => [
              ...current,
              created,
            ]
          )
        }

        setSelectedRating(
          ratingValue
        )

        const updatedNovel =
          await getNovel(novel.id)

        setNovel(updatedNovel)
      } catch (error) {
        console.error(
          'RATING ERROR:',
          error
        )
      } finally {
        setRatingLoading(false)
      }
    }

  const handleCommentSubmit =
    async () => {
      if (!novel) {
        return
      }

      const text =
        commentText.trim()

      if (
        !text ||
        commentLoading
      ) {
        return
      }

      const access =
        localStorage.getItem(
          'access'
        )

      if (!access) {
        navigate('/login')
        return
      }

      setCommentLoading(true)
      setCommentsError('')

      try {
        const newComment =
          await createComment(
            novel.id,
            text
          )

        setComments(
          (current) => [
            ...current,
            newComment,
          ]
        )

        setCommentText('')
      } catch (error) {
        console.error(
          'CREATE COMMENT ERROR:',
          error
        )

        if (
          error instanceof Error &&
          error.message.includes('401')
        ) {
          setCommentsError(
            'You need to log in before posting your review.'
          )
        } else {
          setCommentsError(
            'Could not post your review.'
          )
        }
      } finally {
        setCommentLoading(false)
      }
    }

  const openChapter = (
    chapterId: number
  ) => {
    navigate(
      `/chapter/${chapterId}`
    )
  }

  const startReading =
    async () => {
      if (!novel) {
        return
      }

      try {
        const data =
          await getChapters(
            novel.id,
            1
          )

        const firstChapter =
          asArray<Chapter>(data)
            .sort(
              (a, b) =>
                a.chapter_num -
                b.chapter_num
            )[0]

        if (firstChapter) {
          navigate(
            `/chapter/${firstChapter.id}`
          )
        } else {
          setActiveTab('chapters')
        }
      } catch (error) {
        console.error(
          'START READING ERROR:',
          error
        )

        setActiveTab('chapters')
      }
    }

  const openFolder = (
    folderId: number
  ) => {
    navigate(
      `/folders/${folderId}`,
      {
        state: {
          fromNovel:
            `/novels/${novel?.id}`,
        },
      }
    )
  }

  const toggleChapterGroup =
    async (
      group: number
    ) => {
      const isOpen =
        openChapterGroups.includes(
          group
        )

      if (isOpen) {
        setOpenChapterGroups(
          (current) =>
            current.filter(
              (item) =>
                item !== group
            )
        )

        return
      }

      setOpenChapterGroups(
        (current) => [
          ...current,
          group,
        ]
      )

      await loadChapterGroup(
        group
      )
    }

  if (loading) {
    return (
      <main className="novel-page">
        <div className="novel-container">
          <div className="novel-content-card">
            Loading novel...
          </div>
        </div>
      </main>
    )
  }

  if (!novel) {
    return (
      <main className="novel-page">
        <div className="novel-container">
          <div className="novel-content-card">
            Novel not found.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="novel-page">
      <div className="novel-container">

        <section className="novel-top-card">

          <div className="novel-title-area">
            <h1>
              {novel.title}
            </h1>

            {novel.org_title && (
              <p>
                {novel.org_title}
              </p>
            )}
          </div>

          <div className="novel-info-card">

            <div className="novel-cover">
              <img
                src={novel.img}
                alt={novel.title}
              />
            </div>

            <div className="novel-info">

              <div className="novel-stats">

                <div className="novel-stat">
                  <span>Status</span>

                  <strong>
                    <i className="status-dot" />
                    {novel.status}
                  </strong>
                </div>

                <div className="novel-stat">
                  <span>Views</span>

                  <strong>
                    {views.toLocaleString()}
                  </strong>
                </div>

                <div className="novel-stat">
                  <span>Chapters</span>

                  <strong>
                    {novel.sum_chapter.toLocaleString()}
                  </strong>
                </div>

                <div className="novel-stat">
                  <span>Readers</span>

                  <strong>
                    {readers.toLocaleString()}
                  </strong>
                </div>

                <div className="novel-stat">
                  <span>Rating</span>

                  <strong>
                    {averageRating !== null
                      ? averageRating.toFixed(1)
                      : '—'}
                  </strong>
                </div>

              </div>

              <div className="novel-actions">

                <button
                  className="library-button"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading
                    ? 'Please wait...'
                    : favoriteId !== null
                      ? '✓ In Favorites'
                      : '+ Add to Favorites'}
                </button>

                <button
                  className="library-button"
                  onClick={openFolderModal}
                >
                  + Add to Folder
                </button>

                <button
                  className="reading-button"
                  onClick={startReading}
                >
                  Start Reading
                </button>

              </div>

            </div>

          </div>

          <div className="novel-description">
            <p>
              {novel.description}
            </p>
          </div>

        </section>

        <section className="novel-tabs">

          <button
            className={
              activeTab === 'about'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveTab('about')
            }
          >
            About
          </button>

          <button
            className={
              activeTab === 'chapters'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveTab('chapters')
            }
          >
            Table of Contents
          </button>

          <button
            className={
              activeTab === 'reviews'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveTab('reviews')
            }
          >
            Reviews
          </button>

          <button
            className={
              activeTab === 'community'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveTab('community')
            }
          >
            Community
          </button>

        </section>

        {activeTab === 'about' && (
          <>
            <section className="novel-content-card">

              <h2>About</h2>

              <p className="novel-about-description">
                {novel.description}
              </p>

              <div className="novel-author-section">
                <span>Author</span>

                <strong>
                  {novel.author}
                </strong>
              </div>

              {novel.genre &&
                novel.genre.length > 0 && (
                  <div className="novel-taxonomy-block">

                    <h3>
                      Genres
                    </h3>

                    <div className="novel-tags">
                      {novel.genre.map(
                        (genre) => (
                          <span
                            key={genre.id}
                            className="novel-tag"
                          >
                            {genre.name}
                          </span>
                        )
                      )}
                    </div>

                  </div>
                )}

              {novel.section &&
                novel.section.map(
                  (section) => {
                    const sectionTags =
                      novel.tags
                        ? novel.tags.filter(
                            (tag) =>
                              tag.section_name.id ===
                              section.id
                          )
                        : []

                    if (
                      sectionTags.length === 0
                    ) {
                      return null
                    }

                    return (
                      <div
                        className="novel-section-block"
                        key={section.id}
                      >
                        <h3>
                          {section.name}
                        </h3>

                        <div className="novel-tags">
                          {sectionTags.map(
                            (tag) => (
                              <button
                                type="button"
                                className="novel-tag novel-tag-clickable"
                                key={tag.id}
                                onClick={() =>
                                  navigate(
                                    `/novels?tag=${tag.id}`
                                  )
                                }
                              >
                                {tag.tag_name}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )
                  }
                )}

            </section>

            <section className="novel-content-card">

              <div className="chapter-header">
                <h2>
                  Similar Novels
                </h2>

                <span>
                  {similarNovels.length}
                </span>
              </div>

              {recommendationsLoading ? (
                <div className="empty-chapters">
                  Loading similar novels...
                </div>
              ) : similarNovels.length === 0 ? (
                <div className="empty-chapters">
                  No similar novels found.
                </div>
              ) : (
                <div className="novels-grid">
                  {similarNovels
                    .slice(0, 6)
                    .map((item) => (
                      <NovelCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        image={item.img}
                        status={item.status}
                        chapters={
                          item.sum_chapter
                        }
                        views={
                          item.views ?? 0
                        }
                        readers={
                          item.reader_count ?? 0
                        }
                      />
                    ))}
                </div>
              )}

            </section>
          </>
        )}

        {activeTab === 'chapters' && (
          <section className="novel-content-card">

            <div className="chapter-header">
              <h2>
                Table of Contents
              </h2>

              <span>
                {chapterCount ||
                  novel.sum_chapter}{' '}
                chapters
              </span>
            </div>

            {chaptersLoading ? (
              <div className="empty-chapters">
                Loading chapters...
              </div>
            ) : chapterCount === 0 ? (
              <div className="empty-chapters">
                No chapters available.
              </div>
            ) : (
              <div className="chapter-groups">

                {chapterGroups.map(
                  ([group, groupChapters]) => {
                    const start =
                      group * 100 + 1

                    const end =
                      Math.min(
                        (group + 1) * 100,
                        chapterCount ||
                          novel.sum_chapter
                      )

                    const isOpen =
                      openChapterGroups.includes(
                        group
                      )

                    const isLoading =
                      loadingChapterGroups.includes(
                        group
                      )

                    const isLoaded =
                      loadedChapterGroups.includes(
                        group
                      )

                    return (
                      <div
                        className="chapter-group"
                        key={group}
                      >

                        <button
                          type="button"
                          className={`chapter-group-title ${
                            isOpen
                              ? 'open'
                              : ''
                          }`}
                          onClick={() =>
                            toggleChapterGroup(
                              group
                            )
                          }
                        >
                          <strong>
                            {start} - {end}
                          </strong>

                          <span>
                            {isLoaded
                              ? `${groupChapters.length} chapters`
                              : 'Open to load'}
                          </span>

                          <span className="chapter-group-toggle">
                            {isLoading
                              ? '…'
                              : isOpen
                                ? '−'
                                : '+'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="chapter-list">

                            {isLoading ? (
                              <div className="empty-chapters">
                                Loading chapters...
                              </div>
                            ) : groupChapters.length === 0 ? (
                              <div className="empty-chapters">
                                No chapters available.
                              </div>
                            ) : (
                              groupChapters.map(
                                (chapter) => (
                                  <button
                                    type="button"
                                    className="chapter-row"
                                    key={
                                      chapter.id
                                    }
                                    onClick={() =>
                                      openChapter(
                                        chapter.id
                                      )
                                    }
                                  >
                                    <div>
                                      <strong>
                                        Chapter{' '}
                                        {
                                          chapter.chapter_num
                                        }
                                      </strong>

                                      {chapter.chapter_title && (
                                        <span>
                                          {
                                            chapter.chapter_title
                                          }
                                        </span>
                                      )}
                                    </div>

                                    <span className="chapter-arrow">
                                      ›
                                    </span>
                                  </button>
                                )
                              )
                            )}

                          </div>
                        )}

                      </div>
                    )
                  }
                )}

              </div>
            )}

          </section>
        )}

        {activeTab === 'reviews' && (
          <section className="novel-content-card">

            <div className="chapter-header">
              <h2>
                Reviews
              </h2>

              <span>
                {comments.length}{' '}
                reviews
              </span>
            </div>

            <div className="review-rating-box">

              <div className="review-rating-title">
                <h3>
                  Your Rating
                </h3>

                <span>
                  {averageRating !== null
                    ? `${averageRating.toFixed(
                        1
                      )} / 5`
                    : 'No ratings yet'}
                </span>
              </div>

              <div className="review-rating-stars">

                {[1, 2, 3, 4, 5].map(
                  (value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() =>
                        handleRating(
                          value
                        )
                      }
                      disabled={
                        ratingLoading
                      }
                      className={
                        value <=
                        selectedRating
                          ? 'review-rating-star active'
                          : 'review-rating-star'
                      }
                      aria-label={`Rate ${value}`}
                    >
                      ★
                    </button>
                  )
                )}

              </div>

              <div className="review-rating-info">

                <span>
                  {ownRating
                    ? `You rated this novel ${ownRating.rating}/5`
                    : 'Give this novel a rating'}
                </span>

                <span>
                  {ratings.length}{' '}
                  rating
                  {ratings.length === 1
                    ? ''
                    : 's'}
                </span>

              </div>

            </div>

            {commentsError && (
              <div className="reviews-error">
                {commentsError}
              </div>
            )}

            {reviewsLoading ? (
              <div className="empty-chapters">
                Loading reviews...
              </div>
            ) : comments.length === 0 ? (
              <div className="empty-chapters">
                No reviews yet.
              </div>
            ) : (
              <div className="reviews-list">

                {comments.map(
                  (comment) => (
                    <div
                      className="review-item"
                      key={comment.id}
                    >

                      <div className="review-header">
                        <strong>
                          User #
                          {
                            comment.user
                          }
                        </strong>
                      </div>

                      <p>
                        {comment.comment}
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

            <div className="review-form">

              <h3>
                Write a Review
              </h3>

              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target.value
                  )
                }
                placeholder="Write your review..."
                rows={5}
              />

              <button
                className="review-submit-button"
                onClick={
                  handleCommentSubmit
                }
                disabled={
                  commentLoading ||
                  commentText.trim()
                    .length === 0
                }
              >
                {commentLoading
                  ? 'Posting...'
                  : 'Post Review'}
              </button>

            </div>

          </section>
        )}

        {activeTab === 'community' && (
          <>
            <section className="novel-content-card">

              <div className="chapter-header">
                <h2>
                  Community
                </h2>

                <span>
                  {novelFolders.length}{' '}
                  folders
                </span>
              </div>

              {communityLoading ? (
                <div className="empty-chapters">
                  Loading community folders...
                </div>
              ) : novelFolders.length === 0 ? (
                <div className="empty-chapters">
                  This novel is not in any folder yet.
                </div>
              ) : (
                <div className="community-folders">

                  {novelFolders.map(
                    (folder) => (
                      <button
                        type="button"
                        className="community-folder"
                        key={folder.id}
                        onClick={() =>
                          openFolder(
                            folder.id
                          )
                        }
                      >
                        <span className="community-folder-icon">
                          📁
                        </span>

                        <strong>
                          {folder.name}
                        </strong>

                        <span className="community-folder-arrow">
                          →
                        </span>
                      </button>
                    )
                  )}

                </div>
              )}

            </section>

            <section className="novel-content-card">

              <div className="chapter-header">
                <h2>
                  Maybe You Like
                </h2>

                <span>
                  {
                    recommendedNovels.length
                  }
                </span>
              </div>

              {recommendationsLoading ? (
                <div className="empty-chapters">
                  Loading recommendations...
                </div>
              ) : recommendedNovels.length === 0 ? (
                <div className="empty-chapters">
                  No recommendations found.
                </div>
              ) : (
                <div className="novels-grid">

                  {recommendedNovels
                    .slice(0, 6)
                    .map((item) => (
                      <NovelCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        image={item.img}
                        status={item.status}
                        chapters={
                          item.sum_chapter
                        }
                        views={
                          item.views ?? 0
                        }
                        readers={
                          item.reader_count ?? 0
                        }
                      />
                    ))}

                </div>
              )}

            </section>
          </>
        )}

        {showFolderModal && (
          <div
            className="folder-modal-overlay"
            onClick={() =>
              setShowFolderModal(false)
            }
          >
            <div
              className="folder-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <h2>
                Add to Folder
              </h2>

              {foldersLoading ? (
                <p>
                  Loading folders...
                </p>
              ) : folders.length === 0 ? (
                <p>
                  No folders found.
                </p>
              ) : (
                folders.map(
                  (folder) => {
                    const alreadyAdded =
                      folderItems.some(
                        (item) =>
                          item.folder ===
                            folder.id &&
                          item.novel ===
                            novel.id
                      )

                    return (
                      <button
                        key={folder.id}
                        disabled={
                          folderAdding ||
                          alreadyAdded
                        }
                        onClick={() =>
                          addToFolder(
                            folder.id
                          )
                        }
                      >
                        {alreadyAdded
                          ? `✓ ${folder.name}`
                          : folder.name}
                      </button>
                    )
                  }
                )
              )}

              <button
                onClick={() =>
                  setShowFolderModal(false)
                }
                disabled={folderAdding}
              >
                Cancel
              </button>

            </div>
          </div>
        )}

      </div>
    </main>
  )
}

export default NovelDetail