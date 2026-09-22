import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchNovels } from '../services/api'

type SearchNovel = {
  id: number
  title: string
  img: string
}


export default function Search() {
  const [params] = useSearchParams()

  const query = params.get('q') || ''

  const [novels, setNovels] = useState<SearchNovel[]>([])
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if (!query) {
      setNovels([])
      return
    }


    const fetchResults = async () => {
      try {
        setLoading(true)

        const data = await searchNovels(query)

        const results = Array.isArray(data)
          ? data
          : data.results ?? []

        setNovels(results)

      } catch (error) {
        console.error('SEARCH ERROR:', error)
        setNovels([])

      } finally {
        setLoading(false)
      }
    }


    fetchResults()

  }, [query])


  return (
    <main className="search-results-page">

      <h1 className="search-title">
        Search results for:
        <span> {query}</span>
      </h1>


      {loading && (
        <p className="search-message">
          Loading...
        </p>
      )}


      {!loading && novels.length === 0 && (
        <p className="search-message">
          No novels found.
        </p>
      )}


      <div className="novel-grid">

        {novels.map((novel) => (

          <Link
            key={novel.id}
            to={`/novels/${novel.id}`}
            className="novel-card"
          >

            <article>

              <div className="novel-card-cover">

                <img
                  className="novel-card-image"
                  src={novel.img}
                  alt={novel.title}
                />

              </div>


              <div className="novel-card-info">

                <h3 className="novel-card-title">
                  {novel.title}
                </h3>

              </div>

            </article>

          </Link>

        ))}

      </div>

    </main>
  )
}