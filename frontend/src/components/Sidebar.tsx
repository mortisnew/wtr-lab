
type SidebarProps = {
  isOpen: boolean
}

function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav>
        <a href="/">Home</a>
        <a href="/novels">Novels</a>
        <a href="/genres">Genres</a>
        <a href="/tags">Tags</a>
        <a href="/favorites">Favorites</a>
        <a href="/recommendations">Recommendations</a>
      </nav>
    </aside>
  )
}

export default Sidebar

