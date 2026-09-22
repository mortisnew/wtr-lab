import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import History from './pages/History'
import { AuthProvider } from './context/AuthContext'
import Folders from './pages/Folders'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import FolderDetail from './pages/FolderDetail'
import Home from './pages/Home'
import Novels from './pages/Novels'
import NovelDetail from './pages/NovelDetail'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Signup from './pages/SignUp'
import ChapterReader from './pages/ChapterReader'
import Search from './pages/search'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar isOpen={sidebarOpen} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/novel" element={<Novels />} />
        <Route path="/novels/:id" element={<NovelDetail />} />
        <Route path="/chapter/:id" element={<ChapterReader />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/folders" element={<Folders />} />
        <Route path="/folders/:id" element={<FolderDetail />}/>

      </Routes>
    </AuthProvider>
  )
}

export default App

