import { useEffect, useState } from 'react'
import NovelCard from '../components/NovelCard'
import { getNovels } from '../services/api'

type Novel = {
  id: number
  title: string
  img: string
  status: string
  sum_chapter: number
  views: number
  reader_count: number
}

type PaginationData = {
  count: number
  next: string | null
  previous: string | null
  results: Novel[]
}

function Novels() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    getNovels(page)
      .then((data: PaginationData) => {
        setNovels(data.results ?? [])
        setTotalPages(Math.ceil((data.count ?? 0) / 12))
      })
      .catch((error) => {
        console.error('NOVELS ERROR:', error)
        setNovels([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page])

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    setPage(newPage)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <main className="novels-page">
      <div className="novels-container">
        <div className="novels-header">
          <div>
            <span className="novels-eyebrow">LIBRARY</span>
            <h1>Novels</h1>
            <p>Browse the complete novel collection.</p>
          </div>

          {!loading && (
            <span className="novels-page-info">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="novels-loading">
            Loading novels...
          </div>
        ) : novels.length === 0 ? (
          <div className="novels-empty">
            No novels found.
          </div>
        ) : (
          <div className="novels-grid">
            {novels.map((novel) => (
              <NovelCard
                key={novel.id}
                id={novel.id}
                title={novel.title}
                image={novel.img}
                status={novel.status}
                chapters={novel.sum_chapter}
                views={novel.views}
                readers={novel.reader_count}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="novels-pagination">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="pagination-button"
            >
              ← Previous
            </button>

            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`pagination-page ${
                      pageNumber === page ? 'active' : ''
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="pagination-button"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default Novels