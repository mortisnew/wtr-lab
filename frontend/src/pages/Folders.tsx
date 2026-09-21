import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getFolders,
  getFolderItems,
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

function Folders() {
  const navigate = useNavigate()

  const [folders, setFolders] = useState<Folder[]>([])
  const [folderCounts, setFolderCounts] = useState<
    Record<number, number>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('access')) {
      navigate('/login')
      return
    }

    const loadFolders = async () => {
      try {
        setLoading(true)
        setError('')

        const folderData = await getFolders()
        const itemData = await getFolderItems()

        setFolders(folderData)

        const counts: Record<number, number> = {}

        itemData.forEach((item: FolderItem) => {
          counts[item.folder] = (counts[item.folder] || 0) + 1
        })

        setFolderCounts(counts)
      } catch (err) {
        console.error('FOLDERS ERROR:', err)
        setError('Failed to load folders.')
      } finally {
        setLoading(false)
      }
    }

    loadFolders()
  }, [navigate])

  if (loading) {
    return (
      <main className="folders-page">
        <div className="folders-container">
          <p>Loading folders...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="folders-page">
      <div className="folders-container">

        <div className="folders-header">
          <div>
            <span className="folders-eyebrow">
              YOUR LIBRARY
            </span>

            <h1>Folders</h1>

            <p>
              Your personal novel collections.
            </p>
          </div>

          <span className="folders-count">
            {folders.length}{' '}
            {folders.length === 1 ? 'Folder' : 'Folders'}
          </span>
        </div>

        {error && (
          <div className="folders-error">
            {error}
          </div>
        )}

        {!error && folders.length === 0 && (
          <div className="folders-empty">
            <h2>No folders yet</h2>

            <p>
              Create a folder to organize your novels.
            </p>
          </div>
        )}

        {!error && folders.length > 0 && (
          <div className="folders-list">

            {folders.map((folder) => {
              const count = folderCounts[folder.id] || 0

              return (
                <Link
                  key={folder.id}
                  to={`/folders/${folder.id}`}
                  className="folder-card"
                >
                  <div className="folder-card-icon">
                    📁
                  </div>

                  <div className="folder-card-info">
                    <h2>{folder.name}</h2>

                    <span>
                      {count}{' '}
                      {count === 1 ? 'Novel' : 'Novels'}
                    </span>
                  </div>
                </Link>
              )
            })}

          </div>
        )}

      </div>
    </main>
  )
}

export default Folders