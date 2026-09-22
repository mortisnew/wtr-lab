import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { searchNovels } from '../services/api'
import { useNavigate } from 'react-router-dom'

type HeaderProps = {
  onMenuClick: () => void
}

type SearchNovel = {
  id: number
  title: string
  img: string
}

function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth()
  const [accountOpen, setAccountOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchNovel[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const query = searchQuery.trim()

    if (!query) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)

        const data = await searchNovels(query)

        setSearchResults(Array.isArray(data) ? data : [])
        setSearchOpen(true)
      } catch (error) {
        console.error('SEARCH ERROR:', error)
        setSearchResults([])
        setSearchOpen(true)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    navigate('/')
  }

  const handleNovelClick = (id: number) => {
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/novels/${id}`)
  }

  const handleSearchKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Escape') {
        setSearchOpen(false)
      }

      if (event.key === 'Enter' && searchQuery.trim()) {
        setSearchOpen(false)
        navigate(
          `/search?q=${encodeURIComponent(searchQuery.trim())}`
        )
      }
    }

  return (
    <header className="site-header">
      <div className="header-container">
        <button
          className="sidebar-button"
          onClick={onMenuClick}
        >
          ☰
        </button>

        <a href="/" className="site-logo">
          WebNovels
        </a>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search novels..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (searchQuery.trim()) {
                setSearchOpen(true)
              }
            }}
          />

          {searchOpen && (
            <div className="search-results">
              {searchLoading ? (
                <div className="search-message">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((novel) => (
                  <button
                    key={novel.id}
                    type="button"
                    className="search-result-item"
                    onClick={() => handleNovelClick(novel.id)}
                  >
                    {novel.img && (
                      <img
                        src={novel.img}
                        alt={novel.title}
                        className="search-result-image"
                      />
                    )}

                    <span className="search-result-title">
                      {novel.title}
                    </span>
                  </button>
                ))
              ) : (
                <div className="search-message">
                  No novels found.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="account-menu">
          <button
            type="button"
            className="account-button"
            onClick={() => setAccountOpen((open) => !open)}
          >
            Account

            <span
              className={`account-arrow ${
                accountOpen ? 'open' : ''
              }`}
            >
              ▾
            </span>
          </button>

          {accountOpen && (
            <div className="account-dropdown">
              {isAuthenticated ? (
                <>
                  <a href="/profile">Profile</a>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <a href="/login">Log In</a>
                  <a href="/signup">Sign In</a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header