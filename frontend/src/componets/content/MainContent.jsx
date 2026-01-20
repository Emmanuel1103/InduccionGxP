import React from 'react'
import './MainContent.css'

const MainContent = ({ sidebarOpen, children }) => {
  return (
    <main className={`main-content ${sidebarOpen ? 'with-sidebar' : 'without-sidebar'}`}>
      <div className="content-container">
        {children}
      </div>
    </main>
  )
}

export default MainContent