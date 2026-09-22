import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getFolders,
  getFolderItems,
  createFolder,
  updateFolder,
  deleteFolder,
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

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>(
    'create'
  )

  const [selectedFolder, setSelectedFolder] =
    useState<Folder | null>(null)

  const [folderName, setFolderName] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const [deleteTarget, setDeleteTarget] =
    useState<Folder | null>(null)

  const [deleting, setDeleting] = useState(false)


  const loadFolders = async () => {
    try {
      setLoading(true)
      setError('')

      const [folderData, itemData] = await Promise.all([
        getFolders(),
        getFolderItems(),
      ])

      setFolders(folderData)

      const counts: Record<number, number> = {}

      itemData.forEach((item: FolderItem) => {
        counts[item.folder] =
          (counts[item.folder] || 0) + 1
      })

      setFolderCounts(counts)

    } catch (err) {
      console.error('FOLDERS ERROR:', err)
      setError('Failed to load folders.')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (!localStorage.getItem('access')) {
      navigate('/login')
      return
    }

    loadFolders()
  }, [navigate])


  const openCreateModal = () => {
    setModalMode('create')
    setSelectedFolder(null)
    setFolderName('')
    setModalError('')
    setModalOpen(true)
  }


  const openEditModal = (folder: Folder) => {
    setModalMode('edit')
    setSelectedFolder(folder)
    setFolderName(folder.name)
    setModalError('')
    setModalOpen(true)
  }


  const closeModal = () => {
    if (saving) return

    setModalOpen(false)
    setSelectedFolder(null)
    setFolderName('')
    setModalError('')
  }


  const handleSaveFolder = async () => {
    const cleanName = folderName.trim()

    if (!cleanName) {
      setModalError('Folder name is required.')
      return
    }

    if (saving) return

    try {
      setSaving(true)
      setModalError('')

      if (modalMode === 'create') {
        const created = await createFolder({
          name: cleanName,
        })

        setFolders((current) => [
          ...current,
          created,
        ])
      } else {
        if (!selectedFolder) return

        const updated = await updateFolder(
          selectedFolder.id,
          {
            name: cleanName,
          }
        )

        setFolders((current) =>
          current.map((folder) =>
            folder.id === selectedFolder.id
              ? {
                  ...folder,
                  ...updated,
                  name:
                    updated?.name ?? cleanName,
                }
              : folder
          )
        )
      }

      closeModal()

    } catch (err) {
      console.error('SAVE FOLDER ERROR:', err)
      setModalError(
        modalMode === 'create'
          ? 'Could not create the folder.'
          : 'Could not update the folder.'
      )
    } finally {
      setSaving(false)
    }
  }


  const openDeleteModal = (folder: Folder) => {
    setDeleteTarget(folder)
  }


  const closeDeleteModal = () => {
    if (deleting) return

    setDeleteTarget(null)
  }


  const handleDeleteFolder = async () => {
    if (!deleteTarget || deleting) return

    try {
      setDeleting(true)

      await deleteFolder(deleteTarget.id)

      setFolders((current) =>
        current.filter(
          (folder) => folder.id !== deleteTarget.id
        )
      )

      setFolderCounts((current) => {
        const updated = { ...current }
        delete updated[deleteTarget.id]
        return updated
      })

      closeDeleteModal()

    } catch (err) {
      console.error('DELETE FOLDER ERROR:', err)
      setError('Could not delete the folder.')
    } finally {
      setDeleting(false)
    }
  }


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
    <>
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

            <div className="folders-header-actions">

              <span className="folders-count">
                {folders.length}{' '}
                {folders.length === 1
                  ? 'Folder'
                  : 'Folders'}
              </span>

              <button
                type="button"
                className="create-folder-button"
                onClick={openCreateModal}
              >
                + Create Folder
              </button>

            </div>
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

              <button
                type="button"
                className="create-folder-button"
                onClick={openCreateModal}
              >
                + Create Folder
              </button>

            </div>
          )}


          {!error && folders.length > 0 && (
            <div className="folders-list">

              {folders.map((folder) => {
                const count =
                  folderCounts[folder.id] || 0

                return (
                  <div
                    key={folder.id}
                    className="folder-card-wrapper"
                  >

                    <Link
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
                          {count === 1
                            ? 'Novel'
                            : 'Novels'}
                        </span>

                      </div>

                    </Link>


                    <div className="folder-card-actions">

                      <button
                        type="button"
                        className="folder-edit-button"
                        onClick={() =>
                          openEditModal(folder)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="folder-delete-button"
                        onClick={() =>
                          openDeleteModal(folder)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </div>
      </main>


      {modalOpen && (
        <div
          className="folder-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeModal()
            }
          }}
        >

          <div
            className="folder-modal"
            role="dialog"
            aria-modal="true"
          >

            <div className="folder-modal-header">

              <div>
                <span className="folders-eyebrow">
                  YOUR LIBRARY
                </span>

                <h2>
                  {modalMode === 'create'
                    ? 'Create Folder'
                    : 'Edit Folder'}
                </h2>
              </div>

              <button
                type="button"
                className="folder-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            <div className="folder-modal-body">

              <label>
                Folder Name

                <input
                  type="text"
                  value={folderName}
                  onChange={(event) =>
                    setFolderName(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      !saving
                    ) {
                      handleSaveFolder()
                    }
                  }}
                  autoFocus
                  disabled={saving}
                  placeholder="My Collection"
                />
              </label>

              {modalError && (
                <div className="folder-modal-error">
                  {modalError}
                </div>
              )}

            </div>


            <div className="folder-modal-actions">

              <button
                type="button"
                className="folder-modal-cancel"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="folder-modal-save"
                onClick={handleSaveFolder}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : modalMode === 'create'
                    ? 'Create'
                    : 'Save Changes'}
              </button>

            </div>

          </div>

        </div>
      )}


      {deleteTarget && (
        <div
          className="folder-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              closeDeleteModal()
            }
          }}
        >

          <div
            className="folder-modal delete-folder-modal"
            role="dialog"
            aria-modal="true"
          >

            <div className="folder-modal-header">

              <div>
                <span className="folders-eyebrow">
                  DELETE FOLDER
                </span>

                <h2>Are you sure?</h2>
              </div>

              <button
                type="button"
                className="folder-modal-close"
                onClick={closeDeleteModal}
                disabled={deleting}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            <div className="folder-modal-body">

              <p>
                Delete{' '}
                <strong>
                  {deleteTarget.name}
                </strong>
                ?
              </p>

              <p>
                The novels inside this folder will not
                be deleted.
              </p>

            </div>


            <div className="folder-modal-actions">

              <button
                type="button"
                className="folder-modal-cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="folder-delete-confirm"
                onClick={handleDeleteFolder}
                disabled={deleting}
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Folder'}
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  )
}

export default Folders