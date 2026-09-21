import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NovelCard from '../components/NovelCard'
import {
  getTrendingNovels,
  getNewNovels,
  getRecentUpdates,
  getRecommendations,
  getRankingNovels,
  getNewsPaper,
} from '../services/api'

type Novel = {
  id: number
  title: string
  img: string
  status: string
  sum_chapter: number
  views: number
  reader_count: number
}

type NewsItem = {
  id: number
  title: string
  content: string
  view_count: number
  created_at: string
}

function getArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

function Home() {
  const [newNovels, setNewNovels] = useState<Novel[]>([])
  const [trending, setTrending] = useState<Novel[]>([])
  const [recommendations, setRecommendations] = useState<Novel[]>([])
  const [recentUpdates, setRecentUpdates] = useState<Novel[]>([])
  const [ranking, setRanking] = useState<Novel[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [rankingPeriod, setRankingPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.allSettled([
      getNewNovels(),
      getTrendingNovels(),
      getRecommendations(),
      getRecentUpdates(),
      getNewsPaper(),
    ]).then((results) => {
      if (!mounted) return

      const [newResult, trendingResult, recommendationResult, updatesResult, newsResult] = results

      if (newResult.status === 'fulfilled') {
        setNewNovels(getArray<Novel>(newResult.value))
      } else {
        console.error('NEW NOVELS ERROR:', newResult.reason)
      }

      if (trendingResult.status === 'fulfilled') {
        setTrending(getArray<Novel>(trendingResult.value))
      } else {
        console.error('TRENDING ERROR:', trendingResult.reason)
      }

      if (recommendationResult.status === 'fulfilled') {
        setRecommendations(getArray<Novel>(recommendationResult.value))
      } else {
        console.error('RECOMMENDATIONS ERROR:', recommendationResult.reason)
      }

      if (updatesResult.status === 'fulfilled') {
        setRecentUpdates(getArray<Novel>(updatesResult.value))
      } else {
        console.error('RECENT UPDATES ERROR:', updatesResult.reason)
      }

      if (newsResult.status === 'fulfilled') {
        setNews(getArray<NewsItem>(newsResult.value))
      } else {
        console.error('NEWS ERROR:', newsResult.reason)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    getRankingNovels(rankingPeriod)
      .then((data) => {
        if (mounted) setRanking(getArray<Novel>(data))
      })
      .catch((error) => console.error('RANKING ERROR:', error))

    return () => {
      mounted = false
    }
  }, [rankingPeriod])

  const renderCards = (novels: Novel[]) => (
    <div className="home-novel-row">
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
  )

  return (
    <main className="home-page">
      <div className="home-content">
        <header className="home-intro">
          <div>
            <span className="home-eyebrow">WTR-LAB STYLE</span>
            <h1>Discover Your Next Novel</h1>
            <p>Explore new releases, trending stories, rankings and the latest updates.</p>
          </div>
        </header>

        {loading && (
          <div className="home-loading">
            <span />
            <span />
            <span />
          </div>
        )}

        {newNovels.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <div>
                <h2>New Novels</h2>
                <p>Recently added to the library</p>
              </div>
              <Link to="/novels" className="home-see-all">See All</Link>
            </div>
            {renderCards(newNovels)}
          </section>
        )}

        {ranking.length > 0 && (
          <section className="home-section home-ranking-section">
            <div className="home-section-header">
              <div>
                <h2>Ranking</h2>
                <p>The most read novels by period</p>
              </div>

              <div className="home-ranking-tabs">
                <button
                  className={rankingPeriod === 'daily' ? 'active' : ''}
                  onClick={() => setRankingPeriod('daily')}
                >
                  Daily
                </button>
                <button
                  className={rankingPeriod === 'weekly' ? 'active' : ''}
                  onClick={() => setRankingPeriod('weekly')}
                >
                  Weekly
                </button>
                <button
                  className={rankingPeriod === 'monthly' ? 'active' : ''}
                  onClick={() => setRankingPeriod('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="home-ranking-list">
              {ranking.slice(0, 10).map((novel, index) => (
                <Link
                  key={novel.id}
                  to={`/novel/${novel.id}`}
                  className="home-ranking-card"
                >
                  <span className={`home-ranking-rank rank-${index + 1}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <img src={novel.img} alt={novel.title} />

                  <div className="home-ranking-info">
                    <h3>{novel.title}</h3>
                    <div>
                      <span>{novel.sum_chapter} Chapters</span>
                      <span>{novel.views ?? 0} Views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {trending.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <div>
                <h2>Trending</h2>
                <p>Popular novels right now</p>
              </div>
              <Link to="/novels" className="home-see-all">See All</Link>
            </div>
            {renderCards(trending)}
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <div>
                <h2>Recommended</h2>
                <p>Stories worth checking out</p>
              </div>
              <Link to="/novels" className="home-see-all">See All</Link>
            </div>
            {renderCards(recommendations)}
          </section>
        )}

        {recentUpdates.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <div>
                <h2>Recently Updated</h2>
                <p>Latest novel updates</p>
              </div>
              <Link to="/novels" className="home-see-all">See All</Link>
            </div>

            <div className="home-updates">
              {recentUpdates.slice(0, 10).map((novel) => (
                <Link
                  key={novel.id}
                  to={`/novel/${novel.id}`}
                  className="home-update"
                >
                  <img src={novel.img} alt={novel.title} />
                  <div className="home-update-info">
                    <h3>{novel.title}</h3>
                    <div>
                      <span>Chapter {novel.sum_chapter}</span>
                      <span className={`home-status ${novel.status}`}>
                        {novel.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {news.length > 0 && (
          <section className="home-section home-news-section">
            <div className="home-section-header">
              <div>
                <h2>Latest News</h2>
                <p>News and announcements</p>
              </div>
            </div>

            <div className="home-news-list">
              {news.slice(0, 5).map((item) => (
                <article key={item.id} className="home-news-item">
                  <div className="home-news-title-row">
                    <h3>{item.title}</h3>
                    <span>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                  <p>{item.content}</p>
                  <small>{item.view_count ?? 0} views</small>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default Home
