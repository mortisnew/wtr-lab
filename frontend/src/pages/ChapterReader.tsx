import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getChapter, getChapters, getNovel } from '../services/api'

type Chapter = {
  id: number
  novel: number
  chapter_num: number
  chapter_title: string | null
  chapter_content: string
}

type ChapterListItem = {
  id: number
  novel: number
  chapter_num: number
  chapter_title: string | null
}

type Novel = {
  id: number
  title: string
}

function ChapterReader() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [novel, setNovel] = useState<Novel | null>(null)

  const [previousChapter, setPreviousChapter] =
    useState<ChapterListItem | null>(null)

  const [nextChapter, setNextChapter] =
    useState<ChapterListItem | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const loadChapter = async () => {
      setLoading(true)
      setError('')

      try {
        const chapterData = await getChapter(Number(id))
        setChapter(chapterData)

        const novelData = await getNovel(chapterData.novel)
        setNovel(novelData)

        /*
         * Get the complete chapter list.
         * We don't use novel.chapters here because that
         * list can be incomplete/paginated.
         */
        const firstPage = await getChapters(chapterData.novel, 1)

        let allChapters: ChapterListItem[] = [
          ...(firstPage?.results || []),
        ]

        const totalPages = firstPage?.count
          ? Math.ceil(firstPage.count / 50)
          : 1

        if (totalPages > 1) {
          for (let page = 2; page <= totalPages; page++) {
            const pageData = await getChapters(
              chapterData.novel,
              page
            )

            allChapters = [
              ...allChapters,
              ...(pageData?.results || []),
            ]
          }
        }

        allChapters.sort(
          (a, b) => a.chapter_num - b.chapter_num
        )

        const currentIndex = allChapters.findIndex(
          item => item.id === chapterData.id
        )

        if (currentIndex > 0) {
          setPreviousChapter(allChapters[currentIndex - 1])
        } else {
          setPreviousChapter(null)
        }

        if (
          currentIndex >= 0 &&
          currentIndex < allChapters.length - 1
        ) {
          setNextChapter(allChapters[currentIndex + 1])
        } else {
          setNextChapter(null)
        }

        window.scrollTo({
          top: 0,
          behavior: 'auto',
        })
      } catch (error) {
        console.error('CHAPTER READER ERROR:', error)

        setChapter(null)
        setNovel(null)
        setPreviousChapter(null)
        setNextChapter(null)
        setError('Could not load this chapter.')
      } finally {
        setLoading(false)
      }
    }

    loadChapter()
  }, [id])

  const openChapter = (chapterId: number) => {
    navigate(`/chapter/${chapterId}`)
  }

  const backToNovel = () => {
    if (chapter) {
      navigate(`/novel/${chapter.novel}`)
    }
  }

  if (loading) {
    return (
      <main className="reader-page">
        <div className="reader-container">
          <div className="reader-loading">
            <span className="reader-loading-dot" />
            Loading chapter...
          </div>
        </div>
      </main>
    )
  }

  if (error || !chapter) {
    return (
      <main className="reader-page">
        <div className="reader-container">
          <section className="reader-error-card">
            <div className="reader-error-icon">!</div>

            <h1>Chapter not found</h1>

            <p>
              {error || 'This chapter could not be loaded.'}
            </p>

            <button
              type="button"
              className="reader-back-button"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="reader-page">
      <div className="reader-container">

        <header className="reader-header">
          <button
            type="button"
            className="reader-novel-button"
            onClick={backToNovel}
          >
            <span>←</span>
            <span>Back to Novel</span>
          </button>

          <div className="reader-novel-info">
            <span className="reader-novel-label">
              {novel?.title || 'Novel'}
            </span>

            <span className="reader-chapter-number">
              Chapter {chapter.chapter_num}
            </span>
          </div>
        </header>

        <article className="reader-card">

          <div className="reader-title">
            <span className="reader-eyebrow">
              CHAPTER {chapter.chapter_num}
            </span>

            <h1>
              {chapter.chapter_title ||
                `Chapter ${chapter.chapter_num}`}
            </h1>

            <div className="reader-divider" />
          </div>

          <div className="reader-content">
            {chapter.chapter_content}
          </div>

          <div className="reader-navigation">

            <button
              type="button"
              className="reader-nav-button previous"
              disabled={!previousChapter}
              onClick={() => {
                if (previousChapter) {
                  openChapter(previousChapter.id)
                }
              }}
            >
              <span className="reader-nav-arrow">
                ←
              </span>

              <span className="reader-nav-text">
                <small>Previous</small>

                <strong>
                  {previousChapter
                    ? `Chapter ${previousChapter.chapter_num}`
                    : 'No previous chapter'}
                </strong>
              </span>
            </button>

            <button
              type="button"
              className="reader-center-button"
              onClick={backToNovel}
            >
              <span>☰</span>
              Table of Contents
            </button>

            <button
              type="button"
              className="reader-nav-button next"
              disabled={!nextChapter}
              onClick={() => {
                if (nextChapter) {
                  openChapter(nextChapter.id)
                }
              }}
            >
              <span className="reader-nav-text">
                <small>Next</small>

                <strong>
                  {nextChapter
                    ? `Chapter ${nextChapter.chapter_num}`
                    : 'End of novel'}
                </strong>
              </span>

              <span className="reader-nav-arrow">
                →
              </span>
            </button>

          </div>

        </article>

        <div className="reader-bottom-actions">
          <button
            type="button"
            className="reader-bottom-back"
            onClick={backToNovel}
          >
            ← Back to {novel?.title || 'Novel'}
          </button>
        </div>

      </div>
    </main>
  )
}

export default ChapterReader