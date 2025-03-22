import { Layout } from '../components/Layout'
import { useState } from 'react'

export default function Home() {
  const [data, setData] = useState([])

  return (
    <Layout>
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Welcome to Our Application
          </h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">
              This is a full-stack application with TypeScript and Python.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  )
}
