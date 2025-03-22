import React from 'react'
import Head from 'next/head'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Full-stack Application</title>
        <meta name="description" content="A full-stack application with TypeScript and Python" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold">Our App</h1>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </div>
    </>
  )
}
