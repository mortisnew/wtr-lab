import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getFavorites,
  getNovel,
  getImageUrl,
} from '../services/api'

type Favorite = {
  id: number
  user: number
  novel: number
}

type Novel = {
  id: number
  title: string
  img: string
  slug: string
  status: string
  author: string
}

type FavoriteNovel = {
  favorite: Favorite
  novel: Novel
}

function Favorites() {
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState<FavoriteNovel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('access')) {
      navigate('/login')
      return
    }

    const loadFavorites = async () => {
      try {
        setLoading(true)
        setError('')

        const favoriteData = await getFavorites()

        const novels = await Promise.all(
          favoriteData.map(async (favorite: Favorite) => {
            const novel = await getNovel(favorite.novel)

            return {
              favorite,
              novel,
            }
          })
        )

        setFavorites(novels)
      } catch (err) {
        console.error('FAVORITES ERROR:', err)
        setError('Failed to load favorites.')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [navigate])

  if (loading) {
    return (
      <main className="favorites-page">
        <div className="favorites-container">
          <p>Loading favorites...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="favorites-page">
      <div className="favorites-container">
        <div className="favorites-header">
          <div>
            <span className="favorites-eyebrow">YOUR LIBRARY</span>
            <h1>Favorites</h1>
            <p>Novels you have saved to your favorites.</p>
          </div>

          <span className="favorites-count">
            {favorites.length} {favorites.length === 1 ? 'Novel' : 'Novels'}
          </span>
        </div>

        {error && (
          <div className="favorites-error">
            {error}
          </div>
        )}

        {!error && favorites.length === 0 && (
          <div className="favorites-empty">
            <h2>No favorites yet</h2>
            <p>
              Add novels to your favorites and they will appear here.
            </p>

            <Link to="/novels" className="favorites-browse-button">
              Browse Novels
            </Link>
          </div>
        )}

        {!error && favorites.length > 0 && (
          <div className="favorites-grid">
            {favorites.map(({ favorite, novel }) => (
              <Link
                key={favorite.id}
                to={`/novels/${novel.id}`}
                className="favorite-card"
              >
                <div className="favorite-cover">
                  <img
                    src={getImageUrl(novel.img)}
                    alt={novel.title}
                  />
                </div>

                <div className="favorite-info">
                  <h2>{novel.title}</h2>

                  {novel.author && (
                    <p className="favorite-author">
                      {novel.author}
                    </p>
                  )}

                  <span className="favorite-status">
                    {novel.status}
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

export default Favorites