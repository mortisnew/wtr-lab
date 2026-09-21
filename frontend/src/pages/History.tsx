import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getReadingHistory,
  getNovel,
  getImageUrl,
} from '../services/api'

type NovelRead = {
  id: number
  user: number
  novel: number
  ip_address: string | null
  created_at: string
}

type Novel = {
  id: number
  title: string
  img: string
  slug: string
  status: string
  author: string
}

type HistoryItem = {
  history: NovelRead
  novel: Novel
}

function History() {
  const navigate = useNavigate()

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('access')) {
      navigate('/login')
      return
    }

    const loadHistory = async () => {
      try {
        setLoading(true)
        setError('')

        const historyData = await getReadingHistory()

        const novels = await Promise.all(
          historyData.map(async (item: NovelRead) => {
            const novel = await getNovel(item.novel)

            return {
              history: item,
              novel,
            }
          })
        )

        novels.sort(
          (a, b) =>
            new Date(b.history.created_at).getTime() -
            new Date(a.history.created_at).getTime()
        )

        setHistory(novels)
      } catch (err) {
        console.error('HISTORY ERROR:', err)
        setError('Failed to load reading history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [navigate])

  if (loading) {
    return (
      <main className="history-page">
        <div className="history-container">
          <p>Loading reading history...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="history-page">
      <div className="history-container">
        <div className="history-header">
          <div>
            <span className="history-eyebrow">YOUR LIBRARY</span>

            <h1>Reading History</h1>

            <p>
              Novels you have recently read.
            </p>
          </div>

          <span className="history-count">
            {history.length}{' '}
            {history.length === 1 ? 'Novel' : 'Novels'}
          </span>
        </div>

        {error && (
          <div className="history-error">
            {error}
          </div>
        )}

        {!error && history.length === 0 && (
          <div className="history-empty">
            <h2>No reading history yet</h2>

            <p>
              Novels you read will appear here.
            </p>

            <Link
              to="/novels"
              className="history-browse-button"
            >
              Browse Novels
            </Link>
          </div>
        )}

        {!error && history.length > 0 && (
          <div className="history-grid">
            {history.map(({ history: item, novel }) => (
              <Link
                key={item.id}
                to={`/novels/${novel.id}`}
                className="history-card"
              >
                <div className="history-cover">
                  <img
                    src={getImageUrl(novel.img)}
                    alt={novel.title}
                  />
                </div>

                <div className="history-info">
                  <h2>{novel.title}</h2>

                  {novel.author && (
                    <p className="history-author">
                      {novel.author}
                    </p>
                  )}

                  <span className="history-status">
                    {novel.status}
                  </span>

                  <span className="history-date">
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default History