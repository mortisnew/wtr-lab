import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getFolder,
  getFolderItems,
  getNovel,
  getImageUrl,
  createFolderItem,
  deleteFolderItem,
  searchNovels,
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

type SearchNovel = {
  id: number
  title: string
  img: string
}

function FolderDetail() {
  const { id } = useParams()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [novels, setNovels] = useState<FolderNovel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchNovel[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [addingNovelId, setAddingNovelId] = useState<number | null>(null)

  const [removeItem, setRemoveItem] = useState<FolderNovel | null>(null)
  const [removing, setRemoving] = useState(false)

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

  useEffect(() => {
    loadFolder()
  }, [id])

  useEffect(() => {
    if (!showAddModal) {
      setSearchQuery('')
      setSearchResults([])
      return
    }

    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)

        const data = await searchNovels(
          searchQuery.trim()
        )

        const results = Array.isArray(data)
          ? data
          : data.results ?? []

        setSearchResults(results)
      } catch (err) {
        console.error('NOVEL SEARCH ERROR:', err)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, showAddModal])

  const isNovelInFolder = (novelId: number) => {
    return novels.some(
      ({ novel }) => novel.id === novelId
    )
  }

  const handleAddNovel = async (novel: SearchNovel) => {
    if (!folder || isNovelInFolder(novel.id)) {
      return
    }

    try {
      setAddingNovelId(novel.id)

      await createFolderItem({
        folder: folder.id,
        novel: novel.id,
      })

      await loadFolder()

      setSearchQuery('')
      setSearchResults([])
      setShowAddModal(false)
    } catch (err) {
      console.error('ADD NOVEL ERROR:', err)
      alert('Failed to add this novel.')
    } finally {
      setAddingNovelId(null)
    }
  }

  const handleRemoveNovel = async () => {
    if (!removeItem) {
      return
    }

    try {
      setRemoving(true)

      await deleteFolderItem(removeItem.item.id)

      setNovels((current) =>
        current.filter(
          ({ item }) =>
            item.id !== removeItem.item.id
        )
      )

      setRemoveItem(null)
    } catch (err) {
      console.error('REMOVE NOVEL ERROR:', err)
      alert('Failed to remove this novel.')
    } finally {
      setRemoving(false)
    }
  }

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

          <button
            type="button"
            className="folder-add-novel-button"
            onClick={() => setShowAddModal(true)}
          >
            + Add Novel
          </button>
        </div>

        {novels.length === 0 && (
          <div className="folder-detail-empty">
            <h2>This folder is empty</h2>

            <p>
              Add novels to this folder and they
              will appear here.
            </p>

            <button
              type="button"
              className="folder-empty-add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Novel
            </button>
          </div>
        )}

        {novels.length > 0 && (
          <div className="folder-detail-grid">
            {novels.map(({ item, novel }) => (
              <div
                key={item.id}
                className="folder-novel-wrapper"
              >
                <Link
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

                <button
                  type="button"
                  className="folder-remove-novel-button"
                  onClick={() => setRemoveItem({
                    item,
                    novel,
                  })}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ADD NOVEL MODAL */}

      {showAddModal && (
        <div
          className="folder-modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="folder-modal folder-add-novel-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="folder-modal-header">
              <div>
                <span className="folder-detail-eyebrow">
                  YOUR LIBRARY
                </span>

                <h2>Add Novel</h2>
              </div>

              <button
                type="button"
                className="folder-modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>
            </div>

            <div className="folder-modal-body">

              <input
                type="text"
                className="folder-novel-search-input"
                placeholder="Search novels..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                autoFocus
              />

              <div className="folder-search-results">

                {!searchQuery.trim() && (
                  <p className="folder-search-message">
                    Start typing to search for novels.
                  </p>
                )}

                {searchLoading && (
                  <p className="folder-search-message">
                    Searching...
                  </p>
                )}

                {!searchLoading &&
                  searchQuery.trim() &&
                  searchResults.length === 0 && (
                    <p className="folder-search-message">
                      No novels found.
                    </p>
                  )}

                {!searchLoading &&
                  searchResults.map((novel) => {
                    const alreadyAdded =
                      isNovelInFolder(novel.id)

                    const isAdding =
                      addingNovelId === novel.id

                    return (
                      <div
                        key={novel.id}
                        className="folder-search-result"
                      >
                        <div className="folder-search-result-cover">
                          <img
                            src={getImageUrl(novel.img)}
                            alt={novel.title}
                          />
                        </div>

                        <div className="folder-search-result-info">
                          <h3>{novel.title}</h3>
                        </div>

                        <button
                          type="button"
                          className={
                            alreadyAdded
                              ? 'folder-search-added-button'
                              : 'folder-search-add-button'
                          }
                          disabled={
                            alreadyAdded || isAdding
                          }
                          onClick={() =>
                            handleAddNovel(novel)
                          }
                        >
                          {alreadyAdded
                            ? 'Added'
                            : isAdding
                              ? 'Adding...'
                              : 'Add'}
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE NOVEL MODAL */}

      {removeItem && (
        <div
          className="folder-modal-overlay"
          onClick={() => setRemoveItem(null)}
        >
          <div
            className="folder-modal folder-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="folder-modal-header">
              <div>
                <span className="folder-detail-eyebrow">
                  REMOVE NOVEL
                </span>

                <h2>Remove from folder?</h2>
              </div>

              <button
                type="button"
                className="folder-modal-close"
                onClick={() =>
                  setRemoveItem(null)
                }
              >
                ×
              </button>
            </div>

            <div className="folder-modal-body">
              <p>
                Are you sure you want to remove
                <strong> {removeItem.novel.title} </strong>
                from this folder?
              </p>

              <div className="folder-modal-actions">
                <button
                  type="button"
                  className="folder-modal-cancel"
                  onClick={() =>
                    setRemoveItem(null)
                  }
                  disabled={removing}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="folder-delete-confirm"
                  onClick={handleRemoveNovel}
                  disabled={removing}
                >
                  {removing
                    ? 'Removing...'
                    : 'Remove Novel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default FolderDetail