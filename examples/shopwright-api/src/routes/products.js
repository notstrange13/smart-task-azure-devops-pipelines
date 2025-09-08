const express = require('express');
const router = express.Router();

// Mock product data for demo
const products = [
    {
        id: 1,
        name: 'Premium Wireless Headphones',
        description: 'High-quality noise-canceling wireless headphones with 30-hour battery life',
        price: 299.99,
        category: 'Electronics',
        stock: 50,
        images: ['headphones1.jpg', 'headphones2.jpg'],
        brand: 'AudioTech',
        rating: 4.8,
        reviews: 1247,
    },
    {
        id: 2,
        name: 'Smart Fitness Watch',
        description:
            'Track your health and fitness with GPS, heart rate monitor, and sleep tracking',
        price: 199.99,
        category: 'Electronics',
        stock: 75,
        images: ['watch1.jpg', 'watch2.jpg'],
        brand: 'FitTrack',
        rating: 4.6,
        reviews: 892,
    },
    {
        id: 3,
        name: 'Organic Coffee Blend',
        description: 'Premium organic coffee beans from sustainable farms',
        price: 24.99,
        category: 'Food & Beverage',
        stock: 200,
        images: ['coffee1.jpg'],
        brand: 'GreenBean Co',
        rating: 4.9,
        reviews: 456,
    },
    {
        id: 4,
        name: 'Ergonomic Office Chair',
        description: 'Comfortable office chair with lumbar support and adjustable height',
        price: 349.99,
        category: 'Furniture',
        stock: 25,
        images: ['chair1.jpg', 'chair2.jpg'],
        brand: 'ComfortSeating',
        rating: 4.7,
        reviews: 234,
    },
    {
        id: 5,
        name: 'Yoga Mat Pro',
        description: 'Non-slip eco-friendly yoga mat with alignment guides',
        price: 79.99,
        category: 'Sports & Fitness',
        stock: 100,
        images: ['yoga1.jpg'],
        brand: 'ZenFit',
        rating: 4.5,
        reviews: 678,
    },
];

/**
 * @route GET /api/products
 * @desc Get all products with optional filtering
 * @access Public
 */
router.get('/', (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, sort, page = 1, limit = 10 } = req.query;

        let filteredProducts = [...products];

        // Filter by category
        if (category) {
            filteredProducts = filteredProducts.filter(p =>
                p.category.toLowerCase().includes(category.toLowerCase())
            );
        }

        // Filter by price range
        if (minPrice) {
            filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Search by name or description
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredProducts = filteredProducts.filter(
                p =>
                    p.name.toLowerCase().includes(searchTerm) ||
                    p.description.toLowerCase().includes(searchTerm)
            );
        }

        // Sort products
        if (sort) {
            switch (sort) {
                case 'price-asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    filteredProducts.sort((a, b) => b.rating - a.rating);
                    break;
                case 'name':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        res.json({
            products: paginatedProducts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(filteredProducts.length / limit),
                totalItems: filteredProducts.length,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route GET /api/products/:id
 * @desc Get single product by ID
 * @access Public
 */
router.get('/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route GET /api/products/category/:category
 * @desc Get products by category
 * @access Public
 */
router.get('/category/:category', (req, res) => {
    try {
        const category = req.params.category;
        const categoryProducts = products.filter(
            p => p.category.toLowerCase() === category.toLowerCase()
        );

        if (categoryProducts.length === 0) {
            return res.status(404).json({ message: 'No products found in this category' });
        }

        res.json(categoryProducts);
    } catch (error) {
        console.error('Get category products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route POST /api/products
 * @desc Create new product (Admin only)
 * @access Private/Admin
 */
router.post('/', (req, res) => {
    try {
        // In real app, check for admin authentication
        const { name, description, price, category, stock, images, brand } = req.body;

        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newProduct = {
            id: products.length + 1,
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock) || 0,
            images: images || [],
            brand: brand || '',
            rating: 0,
            reviews: 0,
        };

        products.push(newProduct);

        res.status(201).json({
            message: 'Product created successfully',
            product: newProduct,
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route PUT /api/products/:id
 * @desc Update product (Admin only)
 * @access Private/Admin
 */
router.put('/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product fields
        const updatedProduct = {
            ...products[productIndex],
            ...req.body,
            id: productId, // Ensure ID doesn't change
        };

        products[productIndex] = updatedProduct;

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct,
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route DELETE /api/products/:id
 * @desc Delete product (Admin only)
 * @access Private/Admin
 */
router.delete('/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        products.splice(productIndex, 1);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
