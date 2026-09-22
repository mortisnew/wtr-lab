import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getComments,
  getNovel,
  getProfile,
  updateProfile,
} from '../services/api'


type ProfileData = {
  id: number
  username: string
  email: string
}

type Comment = {
  id: number
  user: number
  novel: number
  comment: string
}

type NovelInfo = {
  id: number
  title: string
}

function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [novelTitles, setNovelTitles] = useState<Record<number, string>>({})

  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [error, setError] = useState('')

  const [visibleCount, setVisibleCount] = useState(30)

  const [editOpen, setEditOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const access = localStorage.getItem('access')

    if (!access) {
      navigate('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const data = await getProfile()

        const user = Array.isArray(data)
          ? data[0]
          : data?.results?.[0] ?? data

        if (!user) {
          throw new Error('Profile not found')
        }

        setProfile(user)
        setUsername(user.username)
        setEmail(user.email)
      } catch (err) {
        console.error('PROFILE ERROR:', err)
        setError('Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  useEffect(() => {
    if (!profile) return

    const loadComments = async () => {
      setCommentsLoading(true)

      try {
        const data = await getComments()

        const userComments = data
          .filter((item: Comment) => item.user === profile.id)
          .sort((a: Comment, b: Comment) => b.id - a.id)

        setComments(userComments)

        const uniqueNovelIds = [
          ...new Set(
            userComments.map((comment: Comment) => comment.novel)
          ),
        ]

        const novelResults = await Promise.all(
          uniqueNovelIds.map(async (novelId) => {
            try {
              const novel = (await getNovel(novelId)) as NovelInfo
              return {
                id: novelId,
                title: novel.title,
              }
            } catch (error) {
              console.error(
                `Could not load novel ${novelId}:`,
                error
              )

              return {
                id: novelId,
                title: 'Unknown Novel',
              }
            }
          })
        )

        const titles: Record<number, string> = {}

        novelResults.forEach((novel) => {
          titles[novel.id] = novel.title
        })

        setNovelTitles(titles)
      } catch (err) {
        console.error('PROFILE COMMENTS ERROR:', err)
      } finally {
        setCommentsLoading(false)
      }
    }

    loadComments()
  }, [profile])

  const visibleComments = useMemo(
    () => comments.slice(0, visibleCount),
    [comments, visibleCount]
  )

  const handleEditOpen = () => {
    if (!profile) return

    setUsername(profile.username)
    setEmail(profile.email)
    setSaveError('')
    setEditOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!profile || saving) return

    const cleanUsername = username.trim()
    const cleanEmail = email.trim()

    if (!cleanUsername || !cleanEmail) {
      setSaveError('Username and email are required.')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      const updated = await updateProfile(profile.id, {
        username: cleanUsername,
        email: cleanEmail,
      })

      const updatedProfile = {
        ...profile,
        ...updated,
      }

      setProfile(updatedProfile)
      setUsername(updatedProfile.username)
      setEmail(updatedProfile.email)
      setEditOpen(false)
    } catch (err) {
      console.error('UPDATE PROFILE ERROR:', err)
      setSaveError('Could not update your profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleLoadMore = () => {
    setVisibleCount((current) => current + 30)
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="profile-page">
        <div className="profile-error">
          {error || 'Profile not found.'}
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-main">
            <section className="profile-header-card">
              <div>
                <span className="profile-eyebrow">ACCOUNT</span>

                <h1>Profile</h1>

                <div className="profile-info">
                  <div className="profile-info-row">
                    <span>Username</span>
                    <strong>{profile.username}</strong>
                  </div>

                  <div className="profile-info-row">
                    <span>Email</span>
                    <strong>{profile.email}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="profile-edit-button"
                onClick={handleEditOpen}
              >
                Edit Profile
              </button>
            </section>

            <section className="reviews-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">YOUR ACTIVITY</span>
                  <h2>Latest Reviews</h2>
                </div>

                <span className="review-count">
                  {comments.length} reviews
                </span>
              </div>

              {commentsLoading ? (
                <div className="reviews-empty">
                  Loading your reviews...
                </div>
              ) : comments.length === 0 ? (
                <div className="reviews-empty">
                  You haven't written any reviews yet.
                </div>
              ) : (
                <>
                  <div className="reviews-list">
                    {visibleComments.map((item) => (
                      <article
                        className="review-card"
                        key={item.id}
                      >
                        <div className="review-card-top">
                          <Link
                            to={`/novels/${item.novel}`}
                            className="review-novel-title"
                          >
                            {novelTitles[item.novel] ??
                              'Loading novel...'}
                          </Link>
                        </div>

                        <p>{item.comment}</p>
                      </article>
                    ))}
                  </div>

                  {visibleCount < comments.length && (
                    <button
                      type="button"
                      className="load-more-button"
                      onClick={handleLoadMore}
                    >
                      Load More
                    </button>
                  )}
                </>
              )}
            </section>
          </div>

          <aside className="profile-sidebar">
            <div className="account-card">
              <div className="account-card-heading">
                <span className="account-icon">◆</span>

                <div>
                  <span className="section-eyebrow">
                    ACCOUNT
                  </span>
                  <h2>Account</h2>
                </div>
              </div>

              <nav className="account-navigation">
                <Link to="/favorites">
                  <span className="nav-icon">♡</span>
                  <span>Favorites</span>
                  <span className="nav-arrow">›</span>
                </Link>

                <Link to="/history">
                  <span className="nav-icon">◷</span>
                  <span>Reading History</span>
                  <span className="nav-arrow">›</span>
                </Link>

                <Link to="/folders">
                  <span className="nav-icon">▣</span>
                  <span>Folders</span>
                  <span className="nav-arrow">›</span>
                </Link>
              </nav>
            </div>
          </aside>
        </div>
      </main>

      {editOpen && (
        <div
          className="profile-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditOpen(false)
            }
          }}
        >
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="modal-header">
              <div>
                <span className="section-eyebrow">
                  ACCOUNT SETTINGS
                </span>
                <h2 id="edit-profile-title">
                  Edit Profile
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setEditOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-form">
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </label>

              {saveError && (
                <div className="modal-error">
                  {saveError}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-save"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Profile