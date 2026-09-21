const API_BASE_URL = 'http://127.0.0.1:8000'

/* =========================================
   TYPES
========================================= */

export type ApiListResponse<T = unknown> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type Genre = {
  id: number
  name: string
}

export type Section = {
  id: number
  name: string
}

export type Tag = {
  id: number
  tag_name: string
  section_name: Section
}

export type NovelApiItem = {
  id: number
  img: string
  title: string
  slug?: string
  status?: string
  org_title?: string
  sum_chapter: number
  author?: string
  genre?: Genre[]
  tags?: Tag[]
  section?: Section[]
  description?: string
  views?: number
  view_count?: number
  reader_count?: number
  trend_score?: number
  rating_log?: unknown[]
}

export type ChapterListItem = {
  id: number
  novel: number
  chapter_num: number
  chapter_title: string | null
}

export type ChapterDetail = ChapterListItem & {
  chapter_content: string
}

/* =========================================
   SIMPLE CACHE
========================================= */

const pageCache = new Map<string, unknown>()

function clearCache(prefix?: string) {
  if (!prefix) {
    pageCache.clear()
    return
  }

  for (const key of pageCache.keys()) {
    if (key.startsWith(prefix)) {
      pageCache.delete(key)
    }
  }
}

/* =========================================
   BASE REQUEST
========================================= */

async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('access')

  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorData: unknown

    try {
      errorData = await response.json()
    } catch {
      errorData = null
    }

    throw new Error(
      `API Error ${response.status}: ${
        JSON.stringify(errorData) || response.statusText
      }`
    )
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

/* =========================================
   PAGINATION HELPER
========================================= */

async function fetchAllPages<T = any>(
  endpoint: string,
  cacheKey = endpoint
): Promise<T[]> {
  const cached = pageCache.get(cacheKey)

  if (cached) {
    return cached as T[]
  }

  const allItems: T[] = []
  let nextEndpoint: string | null = endpoint

  while (nextEndpoint) {
    const data = await fetchApi(nextEndpoint)

    if (Array.isArray(data)) {
      allItems.push(...(data as T[]))
      break
    }

    allItems.push(...((data.results ?? []) as T[]))

    if (!data.next) {
      break
    }

    const nextUrl = new URL(data.next, API_BASE_URL)

    nextEndpoint =
      `${nextUrl.pathname}${nextUrl.search}`
  }

  pageCache.set(cacheKey, allItems)

  return allItems
}

/* =========================================
   AUTH
========================================= */

/*
POST /api/token/
*/
export async function getToken(
  email: string,
  password: string
) {
  return fetchApi('/api/token/', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

/*
POST /api/token/refresh/
*/
export async function refreshToken(refresh: string) {
  return fetchApi('/api/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({
      refresh,
    }),
  })
}

/*
LOGIN
*/
export async function login(
  email: string,
  password: string
) {
  const data = await getToken(email, password)

  localStorage.setItem('access', data.access)
  localStorage.setItem('refresh', data.refresh)

  return data
}

/*
LOGOUT
*/
export function logout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}

/*
CHECK AUTH
*/
export function isAuthenticated() {
  return Boolean(localStorage.getItem('access'))
}

/* =========================================
   ACCOUNTS - PROFILE
========================================= */

/*
GET /accounts/profile/
*/
export function getProfile() {
  return fetchApi('/accounts/profile/')
}

/*
GET /accounts/profile/:id/
*/
export function getProfileById(id: number) {
  return fetchApi(`/accounts/profile/${id}/`)
}

/*
PATCH /accounts/profile/:id/
*/
export function updateProfile(
  id: number,
  data: Record<string, unknown>
) {
  return fetchApi(`/accounts/profile/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/*
POST /accounts/register
*/
export async function register(
  username: string,
  email: string,
  password: string,
  password2: string
) {
  return fetchApi('/accounts/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      password2,
    }),
  })
}

/* =========================================
   CONTENT - NOVELS
========================================= */

/*
GET /content/novels/
*/
export function getNovels(page = 1) {
  return fetchApi(`/content/novels/?page=${page}`)
}

/*
GET /content/novels/:id/
*/
export function getNovel(id: number) {
  return fetchApi(`/content/novels/${id}/`)
}

/*
POST /content/novels/
*/
export function createNovel(
  data: Record<string, unknown>
) {
  return fetchApi('/content/novels/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/*
PATCH /content/novels/:id/
*/
export function updateNovel(
  id: number,
  data: Record<string, unknown>
) {
  return fetchApi(`/content/novels/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/*
DELETE /content/novels/:id/
*/
export function deleteNovel(id: number) {
  return fetchApi(`/content/novels/${id}/`, {
    method: 'DELETE',
  })
}

/* =========================================
   CONTENT - CHAPTERS
========================================= */

/*
GET /content/chapter/?novel=:id&page=:page


*/
export function getChapters(
  novelId: number,
  page = 1
) {
  return fetchApi(
    `/content/chapter/?novel=${novelId}&page=${page}`
  )
}

/*
GET /content/chapter/:id/
*/
export function getChapter(id: number) {
  return fetchApi(`/content/chapter/${id}/`)
}

/*
POST /content/chapter/
*/
export function createChapter(
  data: Record<string, unknown>
) {
  return fetchApi('/content/chapter/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/*
PATCH /content/chapter/:id/
*/
export function updateChapter(
  id: number,
  data: Record<string, unknown>
) {
  return fetchApi(`/content/chapter/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/*
DELETE /content/chapter/:id/
*/
export function deleteChapter(id: number) {
  return fetchApi(`/content/chapter/${id}/`, {
    method: 'DELETE',
  })
}

/* =========================================
   CONTENT - COMMENTS
========================================= */

/*
GET /content/comment/
*/
export function getComments() {
  return fetchAllPages('/content/comment/')
}

/*
GET /content/comment/:id/
*/
export function getComment(id: number) {
  return fetchApi(`/content/comment/${id}/`)
}

/*
POST /content/comment/
*/
export function createComment(
  novelId: number,
  comment: string
) {
  return fetchApi('/content/comment/', {
    method: 'POST',
    body: JSON.stringify({
      novel: novelId,
      comment,
    }),
  })
}

/*
PATCH /content/comment/:id/
*/
export function updateComment(
  id: number,
  data: Record<string, unknown>
) {
  return fetchApi(`/content/comment/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/*
DELETE /content/comment/:id/
*/
export function deleteComment(id: number) {
  return fetchApi(`/content/comment/${id}/`, {
    method: 'DELETE',
  })
}

/* =========================================
   CONTENT - RATINGS
========================================= */

/*
GET /content/rating/
*/
export function getRatings() {
  return fetchApi('/content/rating/')
}

/*
GET /content/rating/:id/
*/
export function getRating(id: number) {
  return fetchApi(`/content/rating/${id}/`)
}

/*
POST /content/rating/
*/
export function createRating(
  data: Record<string, unknown>
) {
  return fetchApi('/content/rating/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/*
PATCH /content/rating/:id/
*/
export function updateRating(
  id: number,
  data: Record<string, unknown>
) {
  return fetchApi(`/content/rating/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/*
DELETE /content/rating/:id/
*/
export function deleteRating(id: number) {
  return fetchApi(`/content/rating/${id}/`, {
    method: 'DELETE',
  })
}

/* =========================================
   HOME
========================================= */

/*
GET /ranking/
GET /ranking/?period=daily
GET /ranking/?period=weekly
GET /ranking/?period=monthly
*/
export function getRankingNovels(
  period?: 'daily' | 'weekly' | 'monthly'
) {
  const query = period
    ? `?period=${period}`
    : ''

  return fetchApi(`/ranking/${query}`)
}

/*
GET /new-novels/
*/
export function getNewNovels() {
  return fetchApi('/new-novels/')
}

/*
GET /trending/
*/
export function getTrendingNovels() {
  return fetchApi('/trending/')
}

/*
GET /recommendation/
*/
export function getHomeRecommendations() {
  return fetchApi('/recommendation/')
}

/*
GET /recent-updates/
*/
export function getRecentUpdates() {
  return fetchApi('/recent-updates/')
}

/*
GET /news-paper/
*/
export function getNewsPaper() {
  return fetchApi('/news-paper/')
}

/* =========================================
   SPECIAL - GENRE
========================================= */
function getSessionCache<T>(key: string): T[] | null {
  const cached = sessionStorage.getItem(key)

  if (!cached) {
    return null
  }

  try {
    return JSON.parse(cached)
  } catch {
    sessionStorage.removeItem(key)
    return null
  }
}

function setSessionCache<T>(key: string, data: T[]) {
  sessionStorage.setItem(key, JSON.stringify(data))
}

let genresPromise: Promise<any[]> | null = null
let sectionsPromise: Promise<any[]> | null = null
let tagsPromise: Promise<any[]> | null = null

export function getGenres() {
  const cached = getSessionCache<any>('webnovels_genres')

  if (cached) {
    return Promise.resolve(cached)
  }

  if (!genresPromise) {
    genresPromise = fetchAllPages('/special/genre/').then((data) => {
      setSessionCache('webnovels_genres', data)
      return data
    })
  }

  return genresPromise
}

export function getSections() {
  const cached = getSessionCache<any>('webnovels_sections')

  if (cached) {
    return Promise.resolve(cached)
  }

  if (!sectionsPromise) {
    sectionsPromise = fetchAllPages('/special/section/').then((data) => {
      setSessionCache('webnovels_sections', data)
      return data
    })
  }

  return sectionsPromise
}

export function getTags() {
  const cached = getSessionCache<any>('webnovels_tags')

  if (cached) {
    return Promise.resolve(cached)
  }

  if (!tagsPromise) {
    tagsPromise = fetchAllPages('/special/tag/').then((data) => {
      setSessionCache('webnovels_tags', data)
      return data
    })
  }

  return tagsPromise
}
/* =========================================
   SPECIAL - SEARCH
========================================= */

/*
GET /special/search?q=...
*/
export function searchNovels(query: string) {
  return fetchApi(
    `/special/search?q=${encodeURIComponent(query)}`
  )
}

/* =========================================
   SPECIAL - RECOMMEND
========================================= */

/*
GET /special/recommend/?novel_id=:id
*/
export function getRecommendedNovels(
  novelId: number
) {
  return fetchApi(
    `/special/recommend/?novel_id=${novelId}`
  )
}

/* =========================================
   SPECIAL - SIMILAR
========================================= */

/*
GET /special/similar/?novel_id=:id
*/
export function getSimilarNovels(
  novelId: number
) {
  return fetchApi(
    `/special/similar/?novel_id=${novelId}`
  )
}

/* =========================================
   SPECIAL - FOLDERS
========================================= */

/*
GET /special/folder/
*/
export function getFolders() {
  return fetchAllPages('/special/folder/')
}

/*
GET /special/folder/:id/
*/
export function getFolder(id: number) {
  return fetchApi(`/special/folder/${id}/`)
}

/*
POST /special/folder/
*/
export function createFolder(
  data: Record<string, unknown>
) {
  clearCache('/special/folder/')

  return fetchApi('/special/folder/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/*
PATCH /special/folder/:id/
*/
export function updateFolder(
  id: number,
  data: Record<string, unknown>
) {
  clearCache('/special/folder/')

  return fetchApi(`/special/folder/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/*
DELETE /special/folder/:id/
*/
export function deleteFolder(id: number) {
  clearCache('/special/folder/')
  clearCache('/special/folder-item/')

  return fetchApi(`/special/folder/${id}/`, {
    method: 'DELETE',
  })
}

/* =========================================
   SPECIAL - FOLDER ITEMS
========================================= */

/*
GET /special/folder-item/
*/
export function getFolderItems() {
  return fetchAllPages('/special/folder-item/')
}

/*
GET /special/folder-item/:id/
*/
export function getFolderItem(id: number) {
  return fetchApi(`/special/folder-item/${id}/`)
}

/*
POST /special/folder-item/
*/
export function createFolderItem(
  data: Record<string, unknown>
) {
  clearCache('/special/folder-item/')

  return fetchApi('/special/folder-item/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/*
PATCH /special/folder-item/:id/
*/
export function updateFolderItem(
  id: number,
  data: Record<string, unknown>
) {
  clearCache('/special/folder-item/')

  return fetchApi(`/special/folder-item/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/*
DELETE /special/folder-item/:id/
*/
export function deleteFolderItem(id: number) {
  clearCache('/special/folder-item/')

  return fetchApi(`/special/folder-item/${id}/`, {
    method: 'DELETE',
  })
}

/* =========================================
   SPECIAL - FAVORITES
========================================= */

/*
GET /special/favorite/
*/
export function getFavorites() {
  return fetchAllPages('/special/favorite/')
}

/*
POST /special/favorite/
*/
export function createFavorite(novelId: number) {
  clearCache('/special/favorite/')

  return fetchApi('/special/favorite/', {
    method: 'POST',
    body: JSON.stringify({
      novel: novelId,
    }),
  })
}

/*
DELETE /special/favorite/:id/
*/
export function deleteFavorite(id: number) {
  clearCache('/special/favorite/')

  return fetchApi(`/special/favorite/${id}/`, {
    method: 'DELETE',
  })
}

/* =========================================
   IMAGE URL
========================================= */

export function getImageUrl(path: string) {
  if (!path) {
    return ''
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path
  }

  return `${API_BASE_URL}${path}`
}

/* =========================================
   HOME RECOMMENDATIONS
========================================= */

export function getRecommendations() {
  return fetchApi('/recommendation/')
}

/* =========================================
   SPECIAL - READING HISTORY
========================================= */

/*
GET /special/novel-read/
*/
export function getReadingHistory() {
  return fetchAllPages('/special/novel-read/')
}

/* =========================================
   SPECIAL - LAST CHAPTER
========================================= */

/*
GET /special/last-chapter/
*/
export function getLastChapters() {
  return fetchAllPages('/special/last-chapter/')
}
