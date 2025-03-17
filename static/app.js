document.addEventListener('DOMContentLoaded', function() {
    // Fetch products from the API
    fetch('/api/products/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            document.getElementById('product-list').innerHTML = `
                <div class="error">
                    <p>Failed to load products. Please try again later.</p>
                </div>
            `;
        });

    // Display products on the page
    function displayProducts(products) {
        const productList = document.getElementById('product-list');
        
        // Clear loading message
        productList.innerHTML = '';
        
        if (products.length === 0) {
            productList.innerHTML = '<p>No products available at this time.</p>';
            return;
        }
        
        // Add more sample products for the demo
        const demoProducts = [
            ...products,
            {
                id: 2,
                name: "Premium T-Shirt",
                description: "100% cotton premium quality t-shirt",
                price: 24.99
            },
            {
                id: 3,
                name: "Coffee Mug",
                description: "Ceramic mug with your custom design",
                price: 14.99
            },
            {
                id: 4,
                name: "Tote Bag",
                description: "Canvas tote bag for everyday use",
                price: 19.99
            },
            {
                id: 5,
                name: "Phone Case",
                description: "Protective case for smartphones",
                price: 12.99
            },
            {
                id: 6,
                name: "Hoodie",
                description: "Warm and comfortable hoodie",
                price: 39.99
            }
        ];
        
        // Create HTML for each product
        demoProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <div class="product-image">Product Image</div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
            `;
            
            productList.appendChild(productCard);
        });
    }
});
