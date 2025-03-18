document.addEventListener('DOMContentLoaded', function() {
    // Store for products and cart
    let allProducts = [];
    let cart = [];
    
    // DOM Elements
    const productList = document.getElementById('product-list');
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    const modal = document.getElementById('product-modal');
    const closeModall
# Update the HTML file with more interactive elements
cat > static/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ButterflyBlue - Print on Demand</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <header>
        <div class="container header-container">
            <div class="logo">
                <h1>ButterflyBlue</h1>
                <p class="tagline">Premium Print on Demand</p>
            </div>
            <nav>
                <ul>
                    <li><a href="#" class="active">Home</a></li>
                    <li><a href="#products">Products</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
            <div class="cart-icon" id="cart-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">0</span>
            </div>
        </div>
    </header>

    <div class="hero">
        <div class="container">
            <div class="hero-content">
                <h2>Custom Products for Your Brand</h2>
                <p>High-quality print-on-demand products with no minimum order quantity</p>
                <a href="#products" class="btn btn-primary">Browse Products</a>
            </div>
        </div>
    </div>

    <main class="container">
        <section id="products" class="products-section">
            <div class="section-header">
                <h2>Our Products</h2>
                <div class="filters">
                    <input type="text" id="search-input" placeholder="Search products...">
                    <select id="category-filter">
                        <option value="">All Categories</option>
                        <option value="apparel">Apparel</option>
                        <option value="accessories">Accessories</option>
                        <option value="home">Home</option>
                    </select>
                    <select id="sort-options">
                        <option value="default">Sort by</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name</option>
                    </select>
                </div>
            </div>
            <div id="product-list" class="product-grid">
                <!-- Products will be loaded here from the API -->
                <div class="loading">Loading products...</div>
            </div>
        </section>

        <section id="about" class="about-section">
            <h2>About ButterflyBlue</h2>
            <div class="about-content">
                <div class="about-image">
                    <div class="placeholder-image">Company Image</div>
                </div>
                <div class="about-text">
                    <p>ButterflyBlue is a premier print-on-demand service dedicated to helping businesses and creators bring their designs to life on high-quality products.</p>
                    <p>Our mission is to provide seamless, sustainable, and scalable printing solutions that allow our customers to focus on what they do best - creating amazing designs.</p>
                    <p>With state-of-the-art printing technology and a commitment to quality, we ensure that every product meets the highest standards.</p>
                    <div class="features">
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>No minimum orders</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Quick turnaround time</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>High-quality materials</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>Worldwide shipping</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact-section">
            <h2>Contact Us</h2>
            <div class="contact-container">
                <div class="contact-info">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <p>123 Print Street, Design City</p>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-phone"></i>
                        <p>+1 (555) 123-4567</p>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-envelope"></i>
                        <p>info@butterflyblue.com</p>
                    </div>
                    <div class="social-links">
                        <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                <form id="contact-form" class="contact-form">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="subject">Subject</label>
                        <input type="text" id="subject" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Message</button>
                </form>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <h2>ButterflyBlue</h2>
                    <p>Premium Print on Demand Services</p>
                </div>
                <div class="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li><a href="#products">Products</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-newsletter">
                    <h3>Stay Updated</h3>
                    <p>Subscribe to our newsletter for the latest products and offers.</p>
                    <form id="newsletter-form">
                        <input type="email" placeholder="Your email address" required>
                        <button type="submit" class="btn">Subscribe</button>
                    </form>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 ButterflyBlue. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Product Modal -->
    <div id="product-modal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div id="modal-product-details">
                <!-- Product details will be inserted here -->
            </div>
        </div>
    </div>

    <!-- Cart Sidebar -->
    <div id="cart-sidebar" class="cart-sidebar">
        <div class="cart-header">
            <h3>Your Cart</h3>
            <span class="close-cart">&times;</span>
        </div>
        <div id="cart-items" class="cart-items">
            <!-- Cart items will be inserted here -->
            <p class="empty-cart">Your cart is empty</p>
        </div>
        <div class="cart-footer">
            <div class="cart-total">
                <p>Total: <span id="cart-total-amount">$0.00</span></p>
            </div>
            <button id="checkout-btn" class="btn btn-primary">Checkout</button>
        </div>
    </div>

    <!-- Notification -->
    <div id="notification" class="notification">
        <p id="notification-message"></p>
    </div>

    <script src="app.js"></script>
</body>
</html>
