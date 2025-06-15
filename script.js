// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const filterBtns = document.querySelectorAll('.filter-btn');
const productGrid = document.querySelector('.product-grid');
const productModal = document.getElementById('productModal');
const closeModal = document.querySelector('.close-modal');
const modalBody = document.querySelector('.modal-body');

// Admin Elements
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const addProductBtn = document.getElementById('addProductBtn');
const productForm = document.getElementById('productForm');
const adminProductForm = document.getElementById('adminProductForm');
const cancelBtn = document.getElementById('cancelBtn');
const imagePreview = document.getElementById('imagePreview');

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Calculate the correct scroll position
            const headerOffset = 70; // Height of the header
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Admin Login
adminLoginBtn.addEventListener('click', () => {
    adminLoginModal.style.display = 'block';
});

// Close Admin Login Modal
document.querySelector('#adminLoginModal .close-modal').addEventListener('click', () => {
    adminLoginModal.style.display = 'none';
});

// Check if admin is logged in
if (localStorage.getItem('adminLoggedIn')) {
    showAdminPanel();
}

// Admin Login Form Submission
adminLoginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('loginError');
    
    if (username === 'vikram' && password === 'vikram123') {
        localStorage.setItem('adminLoggedIn', 'true');
        adminLoginModal.style.display = 'none';
        showAdminPanel();
        // Clear the form
        this.reset();
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'Invalid username or password';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    hideAdminPanel();
});

// Add Product Button
addProductBtn.addEventListener('click', () => {
    productForm.style.display = 'block';
});

// Cancel Button
cancelBtn.addEventListener('click', () => {
    productForm.style.display = 'none';
    adminProductForm.reset();
    imagePreview.innerHTML = '';
});

// Image Preview
document.getElementById('productImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file size (limit to 1MB)
        if (file.size > 1024 * 1024) {
            alert('Image size should be less than 1MB');
            this.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Compress the image before storing
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with 0.7 quality
                const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                imagePreview.innerHTML = `<img src="${compressedImage}" alt="Preview">`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Handle admin form submission
adminProductForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productData = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        image: imagePreview.querySelector('img')?.src || ''
    };
    
    try {
        // Add to products array
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.push(productData);
        
        // Save to localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        // Update display
        updateProductDisplay();
        
        // Reset form
        this.reset();
        imagePreview.innerHTML = '';
        productForm.style.display = 'none';
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            alert('Storage limit exceeded. Please reduce image size or remove some products.');
        } else {
            alert('An error occurred while saving the product.');
        }
        console.error('Error saving product:', error);
    }
});

// Show Admin Panel
function showAdminPanel() {
    adminPanel.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    updateProductDisplay();
}

// Hide Admin Panel
function hideAdminPanel() {
    adminPanel.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

function updateProductDisplay() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productsGrid = document.querySelector('.products-grid');
    
    if (productsGrid) {
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>Category: ${product.category}</p>
                    <p>Price: $${product.price.toFixed(2)}</p>
                </div>
                <div class="product-actions">
                    <button class="admin-btn" onclick="editProduct(${product.id})">Edit</button>
                    <button class="admin-btn secondary" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        imagePreview.innerHTML = `<img src="${product.image}" alt="Preview">`;
        
        // Remove the old product
        const updatedProducts = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        
        // Show form
        productForm.style.display = 'block';
    }
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        updateProductDisplay();
    }
}

// Filter Buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Filter products
        const filter = btn.dataset.filter;
        filterProducts(filter);
    });
});

// Close Modal
closeModal.addEventListener('click', () => {
    productModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === productModal) {
        productModal.style.display = 'none';
    }
    if (e.target === adminLoginModal) {
        adminLoginModal.style.display = 'none';
    }
});

// Display Products
function displayProducts(products) {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="price">$${product.price}</div>
            <button class="view-details" data-id="${product.id}">View Details</button>
        `;
        productGrid.appendChild(productCard);
    });

    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.id);
            const product = products.find(p => p.id === productId);
            showProductDetails(product);
        });
    });
}

// Filter Products
function filterProducts(category) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

// Show Product Details in Modal
function showProductDetails(product) {
    modalBody.innerHTML = `
        <div class="modal-product">
            <img src="${product.image}" alt="${product.name}">
            <div class="modal-product-info">
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <p class="description">${product.description}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        </div>
    `;
    productModal.style.display = 'block';
}

// Initialize
const initialProducts = [
    {
        id: 1,
        name: 'Modern Sofa',
        category: 'living',
        price: 999.99,
        description: 'A comfortable and stylish modern sofa perfect for your living room.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: 2,
        name: 'Queen Size Bed',
        category: 'bedroom',
        price: 799.99,
        description: 'Elegant queen size bed with premium wood finish.',
        image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: 3,
        name: 'Dining Table Set',
        category: 'dining',
        price: 1299.99,
        description: 'Complete dining table set with 6 chairs.',
        image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=60'
    }
];

// Set initial products if none exist
if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(initialProducts));
}

// Display products
displayProducts(JSON.parse(localStorage.getItem('products')));

// Contact Form Handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formMessage = document.getElementById('formMessage');
    const submitBtn = this.querySelector('.submit-btn');
    
    // Get form data
    const formData = new FormData(this);
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Send form data to PHP endpoint
    fetch('contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            formMessage.className = 'form-message success';
            formMessage.textContent = data.message;
            
            // Reset form
            document.getElementById('contactForm').reset();
        } else {
            // Show error message
            formMessage.className = 'form-message error';
            formMessage.textContent = data.message;
        }
    })
    .catch(error => {
        // Show error message
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Failed to send message. Please try again later.';
        console.error('Error:', error);
    })
    .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    });
}); 