import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <footer className="bg-white mt-12 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-text">
          <p>&copy; 2024 Print On Demand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
