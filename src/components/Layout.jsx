import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

const Layout = ({ children, showNav = true }) => {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the page changes
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { path: '/works', label: 'Works' },
    { path: '/exhibitions', label: 'Exhibitions' },
    { path: '/press', label: 'Press' },
    { path: '/biography', label: 'Biography' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <div className="layout">
      {showNav && (
        <>
          <button
            className={`hamburger-button ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}

          <nav className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}>
            <Link to="/" className="sidebar-name">Meltem Sari</Link>
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={location.pathname.startsWith(item.path) ? 'active' : ''}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      <main className={`content ${!showNav ? 'full-width' : ''}`}>
        {children}
      </main>
    </div>
  )
}

export default Layout
