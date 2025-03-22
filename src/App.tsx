import React from 'react'
import Layout from './components/Layout'
import Navigation from './components/Navigation'
import ProductCard from './components/ProductCard'
import OrderForm from './components/OrderForm'

const App: React.FC = () => {
  return (
    <Layout>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Print on Demand</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard 
            title="Custom T-Shirt"
            price={29.99}
            imageUrl="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
          />
          <ProductCard 
            title="Custom Mug"
            price={14.99}
            imageUrl="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d"
          />
          <ProductCard 
            title="Custom Poster"
            price={19.99}
            imageUrl="https://images.unsplash.com/photo-1601599963565-b7ba49346e15"
          />
        </div>
        <OrderForm />
      </main>
    </Layout>
  )
}

export default App
