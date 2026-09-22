import { Link } from 'react-router-dom'

type NovelCardProps = {
  id: number
  title: string
  image: string
  status: string
  chapters: number
  views: number
  readers: number
}

function NovelCard({
  id,
  title,
  image,
  status,
  chapters,
}: NovelCardProps) {
  return (
    <Link to={`/novels/${id}`} className="novel-card">
      <article>
        <div className="novel-card-cover">
          <img
            className="novel-card-image"
            src={image}
            alt={title}
          />

          <span className={`novel-card-status ${status}`}>
            {status}
          </span>
        </div>

        <div className="novel-card-info">
          <h3 className="novel-card-title">
            {title}
          </h3>

          <div className="novel-card-meta">
            <span>{chapters} Chapters</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default NovelCard
