const express = require('express');
const router = express.Router();

// Mock cart data (in real app, this would be in database)
const carts = new Map();

/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */
router.get('/', (req, res) => {
    try {
        // In real app, get userId from authenticated token
        const userId = req.headers['user-id'] || 'demo-user';

        const cart = carts.get(userId) || { items: [], total: 0 };

        res.json(cart);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route POST /api/cart/add
 * @desc Add item to cart
 * @access Private
 */
router.post('/add', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const { productId, quantity = 1, price } = req.body;

        if (!productId || !price) {
            return res.status(400).json({ message: 'Product ID and price are required' });
        }

        // Get or create cart
        let cart = carts.get(userId) || { items: [], total: 0 };

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            // Update quantity of existing item
            cart.items[existingItemIndex].quantity += parseInt(quantity);
        } else {
            // Add new item to cart
            cart.items.push({
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                price: parseFloat(price),
                addedAt: new Date().toISOString(),
            });
        }

        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cart.updatedAt = new Date().toISOString();

        // Save cart
        carts.set(userId, cart);

        res.json({
            message: 'Item added to cart successfully',
            cart,
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route PUT /api/cart/update
 * @desc Update cart item quantity
 * @access Private
 */
router.put('/update', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        let cart = carts.get(userId);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId === parseInt(productId));
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (parseInt(quantity) <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = parseInt(quantity);
        }

        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cart.updatedAt = new Date().toISOString();

        carts.set(userId, cart);

        res.json({
            message: 'Cart updated successfully',
            cart,
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route DELETE /api/cart/remove/:productId
 * @desc Remove item from cart
 * @access Private
 */
router.delete('/remove/:productId', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const productId = parseInt(req.params.productId);

        let cart = carts.get(userId);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Remove item
        cart.items.splice(itemIndex, 1);

        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cart.updatedAt = new Date().toISOString();

        carts.set(userId, cart);

        res.json({
            message: 'Item removed from cart successfully',
            cart,
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route DELETE /api/cart/clear
 * @desc Clear entire cart
 * @access Private
 */
router.delete('/clear', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';

        // Clear cart
        carts.set(userId, { items: [], total: 0, clearedAt: new Date().toISOString() });

        res.json({
            message: 'Cart cleared successfully',
            cart: { items: [], total: 0 },
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route GET /api/cart/count
 * @desc Get cart item count
 * @access Private
 */
router.get('/count', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const cart = carts.get(userId) || { items: [] };

        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        res.json({ count: itemCount });
    } catch (error) {
        console.error('Get cart count error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
