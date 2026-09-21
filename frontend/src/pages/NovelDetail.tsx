import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NovelCard from '../components/NovelCard'
import {
  getNovel,
  getFolders,
  getFolderItems,
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
  view_count?: number
  views?: number
  reader_count?: number
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

type Tab = 'about' | 'chapters' | 'reviews' | 'community'

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

  const [comments, setComments] = useState<Comment[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])

  const [activeTab, setActiveTab] = useState<Tab>('about')

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chapterPage, setChapterPage] = useState(1)
  const [chapterCount, setChapterCount] = useState(0)
  const [chapterNext, setChapterNext] = useState<string | null>(null)
  const [chapterPrevious, setChapterPrevious] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [chaptersLoading, setChaptersLoading] = useState(false)
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
      if (!id) return

      const novelId = Number(id)

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
   * Chapters
   */
  useEffect(() => {
    if (!novel || activeTab !== 'chapters') {
      return
    }

    setChaptersLoading(true)

    getChapters(novel.id, chapterPage)
      .then((data: Paginated<Chapter>) => {
        const chapterResults = asArray<Chapter>(data)
          .filter(
            (chapter) => chapter.novel === novel.id
          )
          .sort(
            (a, b) =>
              a.chapter_num - b.chapter_num
          )

        setChapters(chapterResults)
        setChapterCount(data?.count ?? 0)
        setChapterNext(data?.next ?? null)
        setChapterPrevious(
          data?.previous ?? null
        )
      })
      .catch((error) => {
        console.error(
          'CHAPTERS ERROR:',
          error
        )

        setChapters([])
        setChapterCount(0)
        setChapterNext(null)
        setChapterPrevious(null)
      })
      .finally(() => {
        setChaptersLoading(false)
      })
  }, [novel, activeTab, chapterPage])

  /*
   * Similar + Maybe You Like
   */
  useEffect(() => {
    if (!novel) return

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
          setSimilarNovels(
            asArray<Novel>(similarData)
          )

          setRecommendedNovels(
            asArray<Novel>(recommendedData)
          )
        }
      )
      .catch((error) => {
        console.error(
          'RECOMMENDATIONS ERROR:',
          error
        )

        setSimilarNovels([])
        setRecommendedNovels([])
      })
      .finally(() => {
        setRecommendationsLoading(false)
      })
  }, [novel])

  /*
   * Favorites
   */
  useEffect(() => {
    if (!novel) return

    const access = localStorage.getItem('access')

    if (!access) {
      setFavoriteId(null)
      return
    }

    getFavorites()
      .then((data) => {
        const favoritesList =
          asArray<Favorite>(data)

        const favorite = favoritesList.find(
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
    if (!novel) return

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

    setReviewsLoading(true)
    setCommentsError('')

    getComments()
      .then((data) => {
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
        setReviewsLoading(false)
      })
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
          setFolders(foldersData)

          setFolderItems(
            folderItemsData.filter(
              (item: FolderItem) =>
                item.novel === novel.id
            )
          )
        }
      )
      .catch((error) => {
        console.error(
          'COMMUNITY ERROR:',
          error
        )

        setFolders([])
        setFolderItems([])
      })
      .finally(() => {
        setCommunityLoading(false)
      })
  }, [activeTab, novel])

  /*
   * Derived data
   */
  const averageRating = useMemo(() => {
    if (ratings.length === 0) {
      return 0
    }

    const total = ratings.reduce(
      (sum, item) =>
        sum + Number(item.rating),
      0
    )

    return total / ratings.length
  }, [ratings])

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
    if (!novel) return []

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

  const totalChapterPages =
    Math.max(
      1,
      Math.ceil(
        chapterCount / 12
      )
    )

  const views =
    novel?.view_count ??
    novel?.views ??
    0

  const readers =
    novel?.reader_count ?? 0

  /*
   * Actions
   */

  const addToFolder = async (folderId: number) => {
    if (!novel) return

    try {
      setFolderAdding(true)
      await fetch('http://127.0.0.1:8000/special/folder-item/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
        body: JSON.stringify({
          folder: folderId,
          novel: novel.id,
        }),
      })

      setShowFolderModal(false)
    } catch (error) {
      console.error('ADD TO FOLDER ERROR:', error)
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
        if (favoriteId) {
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
                rating:
                  ratingValue,
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
              rating:
                ratingValue,
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
      if (!novel) return

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

  const openChapter =
    (chapterId: number) => {
      navigate(
        `/chapter/${chapterId}`
      )
    }

  const startReading = async () => {
    if (!novel) return

    try {
      const data = await getChapters(novel.id, 1)
      const firstChapter = asArray<Chapter>(data)[0]

      if (firstChapter) {
        navigate(`/chapter/${firstChapter.id}`)
      } else {
        setActiveTab('chapters')
      }
    } catch (error) {
      console.error('START READING ERROR:', error)
      setActiveTab('chapters')
    }
  }

  const openFolder =
    (folderId: number) => {
      navigate(
        `/folders/${folderId}`,
        {
          state: {
            fromNovel:
              `/novel/${novel?.id}`,
          },
        }
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
            <h1>{novel.title}</h1>

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

                <div className="novel-stat"><span>Chapters</span><strong>{novel.sum_chapter.toLocaleString()}</strong></div><div className="novel-stat"><span>Readers</span><strong>{readers.toLocaleString()}</strong></div><div className="novel-stat"><span>Rating</span><strong>{averageRating > 0 ? averageRating.toFixed(1) : '—'}</strong></div></div><div className="novel-actions"><button className="library-button" onClick={handleFavorite} disabled={favoriteLoading}>{favoriteId ? '✓ In Favorites' : '+ Add to Favorites'}</button><button className="library-button" onClick={() => { if (!localStorage.getItem('access')) { navigate('/login'); return } setShowFolderModal(true) }}>+ Add to Folder</button><button className="reading-button" onClick={startReading}>Start Reading</button></div></div></div><div className="novel-description"><p>{novel.description}</p></div></section><section className="novel-tabs"><button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About</button><button className={activeTab === 'chapters' ? 'active' : ''} onClick={() => {setChapterPage(1); setActiveTab('chapters');}}>Table of Contents</button><button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews</button><button className={activeTab === 'community' ? 'active' : ''} onClick={() => setActiveTab('community')}>Community</button></section>{activeTab === 'about' && (<><section className="novel-content-card"><h2>About</h2><p className="novel-about-description">{novel.description}</p><div className="novel-author-section"><span>Author</span><strong>{novel.author}</strong></div>{novel.genre && novel.genre.length > 0 && (<div className="novel-taxonomy-block"><h3>Genres</h3><div className="novel-tags">{novel.genre.map((genre) => (<span key={genre.id} className="novel-tag">{genre.name}</span>))}</div></div>)}{novel.section && novel.section.map((section) => {const sectionTags = novel.tags ? novel.tags.filter((tag) => tag.section_name.id === section.id) : []; if (sectionTags.length === 0) {return null;} return (<div className="novel-section-block" key={section.id}><h3>{section.name}</h3><div className="novel-tags">{sectionTags.map((tag) => (<button type="button" className="novel-tag novel-tag-clickable" key={tag.id} onClick={() => navigate(`/novels?tag=${tag.id}`)}>{tag.tag_name}</button>))}</div></div>);})}</section><section className="novel-content-card"><div className="chapter-header"><h2>Similar Novels</h2><span>{similarNovels.length}</span></div>{recommendationsLoading ? (<div className="empty-chapters">Loading similar novels...</div>) : similarNovels.length === 0 ? (<div className="empty-chapters">No similar novels found.</div>) : (<div className="novels-grid">{similarNovels.slice(0, 6).map((item) => (<NovelCard key={item.id} id={item.id} title={item.title} image={item.img} status={item.status} chapters={item.sum_chapter} views={item.views ?? item.view_count ?? 0} readers={item.reader_count ?? 0}/>))}</div>)}</section></>)}{activeTab === 'chapters' && (<section className="novel-content-card"><div className="chapter-header"><h2>Table of Contents</h2><span>{chapterCount} chapters</span></div>{chaptersLoading ? (<div className="empty-chapters">Loading chapters...</div>) : chapters.length === 0 ? (<div className="empty-chapters">No chapters available.</div>) : (<><div className="chapter-groups">{Array.from(new Set(chapters.map((chapter) => Math.floor((chapter.chapter_num - 1) / 100)))).map((group) => {const start = group * 100 + 1; const end = (group + 1) * 100; const groupChapters = chapters.filter((chapter) => chapter.chapter_num >= start && chapter.chapter_num <= end); return (<div className="chapter-group" key={group}><div className="chapter-group-title"><strong>{start} - {end}</strong><span>{groupChapters.length} chapters</span></div><div className="chapter-list">{groupChapters.map((chapter) => (<button type="button" className="chapter-row" key={chapter.id} onClick={() => openChapter(chapter.id)}><div><strong>Chapter {chapter.chapter_num}</strong>{chapter.chapter_title && (<span>{chapter.chapter_title}</span>)}</div><span className="chapter-arrow">›</span></button>))}</div></div>);})}</div>{totalChapterPages > 1 && (<div className="novels-pagination" style={{marginTop: '24px'}}><button className="pagination-button" disabled={!chapterPrevious || chaptersLoading} onClick={() => {if (chapterPage > 1) {setChapterPage(chapterPage - 1);}}}>← Previous</button><div className="pagination-pages">{Array.from({length: totalChapterPages}, (_, index) => index + 1).map((pageNumber) => (<button type="button" key={pageNumber} className={`pagination-page ${pageNumber === chapterPage ? 'active' : ''}`} onClick={() => setChapterPage(pageNumber)}>{pageNumber}</button>))}</div><button className="pagination-button" disabled={!chapterNext || chaptersLoading} onClick={() => {if (chapterPage < totalChapterPages) {setChapterPage(chapterPage + 1);}}}>Next →</button></div>)}</>)}</section>)}{activeTab === 'reviews' && (<section className="novel-content-card"><div className="chapter-header"><h2>Reviews</h2><span>{comments.length} reviews</span></div><div className="review-rating-box"><div className="review-rating-title"><h3>Your Rating</h3><span>{averageRating > 0 ? `${averageRating.toFixed(1)} / 5` : 'No ratings yet'}</span></div><div className="review-rating-stars">{[1, 2, 3, 4, 5].map((value) => (<button type="button" key={value} onClick={() => handleRating(value)} disabled={ratingLoading} className={value <= selectedRating ? 'review-rating-star active' : 'review-rating-star'} aria-label={`Rate ${value}`}>★</button>))}</div><div className="review-rating-info"><span>{ownRating ? `You rated this novel ${ownRating.rating}/5` : 'Give this novel a rating'}</span><span>{ratings.length} rating{ratings.length === 1 ? '' : 's'}</span></div></div>{commentsError && (<div className="reviews-error">{commentsError}</div>)}{reviewsLoading ? (<div className="empty-chapters">Loading reviews...</div>) : comments.length === 0 ? (<div className="empty-chapters">No reviews yet.</div>) : (<div className="reviews-list">{comments.map((comment) => (<div className="review-item" key={comment.id}><div className="review-header"><strong>User #{comment.user}</strong></div><p>{comment.comment}</p></div>))}</div>)}<div className="review-form"><h3>Write a Review</h3><textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write your review..." rows={5}/><button className="review-submit-button" onClick={handleCommentSubmit} disabled={commentLoading || commentText.trim().length === 0}>{commentLoading ? 'Posting...' : 'Post Review'}</button></div></section>)}{activeTab === 'community' && (<><section className="novel-content-card"><h2>Community</h2><span>{novelFolders.length} folders</span>{communityLoading ? (<div className="empty-chapters">Loading community folders...</div>) : novelFolders.length === 0 ? (<div className="empty-chapters">This novel is not in any folder yet.</div>) : (<div className="community-folders">{novelFolders.map((folder) => (<button type="button" className="community-folder" key={folder.id} onClick={() => openFolder(folder.id)}><span className="community-folder-icon">📁</span><strong>{folder.name}</strong><span className="community-folder-arrow">→</span></button>))}</div>)}</section><section className="novel-content-card"><div className="chapter-header"><h2>Maybe You Like</h2><span>{recommendedNovels.length}</span></div>{recommendationsLoading ? (<div className="empty-chapters">Loading recommendations...</div>) : recommendedNovels.length === 0 ? (<div className="empty-chapters">No recommendations found.</div>) : (<div className="novels-grid">{recommendedNovels.slice(0, 6).map((item) => (<NovelCard key={item.id} id={item.id} title={item.title} image={item.img} status={item.status} chapters={item.sum_chapter} views={item.views ?? item.view_count ?? 0} readers={item.reader_count ?? 0}/>))}</div>)}</section></>)}
      {showFolderModal && (
        <div className="folder-modal-overlay">
          <div className="folder-modal">
            <h2>Add to Folder</h2>
            {folders.length === 0 ? (
              <p>No folders found.</p>
            ) : (
              folders.map((folder) => (
                <button
                  key={folder.id}
                  disabled={folderAdding}
                  onClick={() => addToFolder(folder.id)}
                >
                  {folder.name}
                </button>
              ))
            )}
            <button onClick={() => setShowFolderModal(false)}>Cancel</button>
          </div>
        </div>
      )}
</div></main>)
}

export default NovelDetail