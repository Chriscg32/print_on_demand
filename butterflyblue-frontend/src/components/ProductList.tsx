// butterflyblue-frontend/src/components/ProductList.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Product {
  id: string
  name: string
  price: number
  description: string
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const { user } = useAuth()

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  return (
    <div>
      {(user as { id: string; email: string; isAdmin?: boolean })?.isAdmin && <button onClick={() => {}}>Add Product</button>}
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          {(user as { id: string; email: string; isAdmin?: boolean })?.isAdmin && (
            <>


              <button onClick={() => {}}>Edit</button>
              <button onClick={() => {}}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}