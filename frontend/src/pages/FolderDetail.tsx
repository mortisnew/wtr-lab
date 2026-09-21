import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getFolder,
  getFolderItems,
  getNovel,
  getImageUrl,
} from '../services/api'

type Folder = {
  id: number
  name: string
  user: number
}

type FolderItem = {
  id: number
  folder: number
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

type FolderNovel = {
  item: FolderItem
  novel: Novel
}

function FolderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [novels, setNovels] = useState<FolderNovel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFolder = async () => {
      try {
        setLoading(true)
        setError('')

        if (!id) {
          throw new Error('Folder ID is missing.')
        }

        const folderId = Number(id)

        const folderData = await getFolder(folderId)
        const itemData = await getFolderItems()

        setFolder(folderData)

        const items = itemData.filter(
          (item: FolderItem) =>
            item.folder === folderId
        )

        const folderNovels = await Promise.all(
          items.map(async (item: FolderItem) => {
            const novel = await getNovel(item.novel)

            return {
              item,
              novel,
            }
          })
        )

        setNovels(folderNovels)
      } catch (err) {
        console.error('FOLDER DETAIL ERROR:', err)
        setError('Failed to load this folder.')
      } finally {
        setLoading(false)
      }
    }

    loadFolder()
  }, [id, navigate])

  if (loading) {
    return (
      <main className="folder-detail-page">
        <div className="folder-detail-container">
          <p>Loading folder...</p>
        </div>
      </main>
    )
  }

  if (error || !folder) {
    return (
      <main className="folder-detail-page">
        <div className="folder-detail-container">
          <Link
            to="/folders"
            className="folder-back-button"
          >
            ← Back to Folders
          </Link>

          <div className="folder-detail-error">
            {error || 'Folder not found.'}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="folder-detail-page">
      <div className="folder-detail-container">

        <Link
          to="/folders"
          className="folder-back-button"
        >
          ← Back to Folders
        </Link>

        <div className="folder-detail-header">
          <div>
            <span className="folder-detail-eyebrow">
              YOUR LIBRARY
            </span>

            <h1>{folder.name}</h1>

            <p>
              {novels.length}{' '}
              {novels.length === 1
                ? 'Novel'
                : 'Novels'}
            </p>
          </div>
        </div>

        {novels.length === 0 && (
          <div className="folder-detail-empty">
            <h2>This folder is empty</h2>

            <p>
              Add novels to this folder and they
              will appear here.
            </p>
          </div>
        )}

        {novels.length > 0 && (
          <div className="folder-detail-grid">
            {novels.map(({ item, novel }) => (
              <Link
                key={item.id}
                to={`/novels/${novel.id}`}
                className="folder-novel-card"
              >
                <div className="folder-novel-cover">
                  <img
                    src={getImageUrl(novel.img)}
                    alt={novel.title}
                  />
                </div>

                <div className="folder-novel-info">
                  <h2>{novel.title}</h2>

                  {novel.author && (
                    <p>{novel.author}</p>
                  )}

                  <span>
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

export default FolderDetail