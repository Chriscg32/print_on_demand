import React from 'react'

interface ProductCardProps {
  title: string
  price: number
  imageUrl: string
}

const ProductCard: React.FC<ProductCardProps> = ({ title, price, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden card-shadow">
      <img 
        src={imageUrl} 
        alt={title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-text mb-4">${price.toFixed(2)}</p>
        <button className="btn-primary w-full">
          Customize Now
        </button>
      </div>
    </div>
  )
}

export default ProductCard
