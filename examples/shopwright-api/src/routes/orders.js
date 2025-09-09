const express = require('express');
const router = express.Router();

// Mock order data
const orders = [];
let orderIdCounter = 1001;

/**
 * @route POST /api/orders
 * @desc Create new order
 * @access Private
 */
router.post('/', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const { items, shippingAddress, billingAddress, paymentMethod, total } = req.body;

        // Validate required fields
        if (!items || !items.length || !shippingAddress || !paymentMethod || !total) {
            return res.status(400).json({
                message: 'Missing required fields: items, shippingAddress, paymentMethod, total',
            });
        }

        // Create new order
        const newOrder = {
            id: orderIdCounter++,
            userId,
            items,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            total: parseFloat(total),
            status: 'pending',
            orderDate: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            trackingNumber: `TRK${orderIdCounter}${Date.now().toString().slice(-4)}`,
        };

        orders.push(newOrder);

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route GET /api/orders
 * @desc Get user's orders
 * @access Private
 */
router.get('/', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const { status, page = 1, limit = 10 } = req.query;

        let userOrders = orders.filter(order => order.userId === userId);

        // Filter by status if provided
        if (status) {
            userOrders = userOrders.filter(order => order.status === status);
        }

        // Sort by order date (newest first)
        userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedOrders = userOrders.slice(startIndex, endIndex);

        res.json({
            orders: paginatedOrders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(userOrders.length / limit),
                totalItems: userOrders.length,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route GET /api/orders/:id
 * @desc Get single order by ID
 * @access Private
 */
router.get('/:id', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const orderId = parseInt(req.params.id);

        const order = orders.find(o => o.id === orderId && o.userId === userId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route PUT /api/orders/:id/cancel
 * @desc Cancel order
 * @access Private
 */
router.put('/:id/cancel', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const orderId = parseInt(req.params.id);

        const orderIndex = orders.findIndex(o => o.id === orderId && o.userId === userId);

        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orders[orderIndex];

        // Check if order can be cancelled
        if (
            order.status === 'shipped' ||
            order.status === 'delivered' ||
            order.status === 'cancelled'
        ) {
            return res.status(400).json({
                message: `Cannot cancel order with status: ${order.status}`,
            });
        }

        // Update order status
        orders[orderIndex] = {
            ...order,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
        };

        res.json({
            message: 'Order cancelled successfully',
            order: orders[orderIndex],
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route GET /api/orders/:id/tracking
 * @desc Get order tracking information
 * @access Private
 */
router.get('/:id/tracking', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const orderId = parseInt(req.params.id);

        const order = orders.find(o => o.id === orderId && o.userId === userId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Mock tracking information
        const trackingInfo = {
            trackingNumber: order.trackingNumber,
            status: order.status,
            estimatedDelivery: order.estimatedDelivery,
            updates: [
                {
                    status: 'pending',
                    description: 'Order received and processing',
                    timestamp: order.orderDate,
                    location: 'Warehouse',
                },
            ],
        };

        // Add more tracking updates based on status
        if (
            order.status === 'processing' ||
            order.status === 'shipped' ||
            order.status === 'delivered'
        ) {
            trackingInfo.updates.push({
                status: 'processing',
                description: 'Order is being prepared for shipment',
                timestamp: new Date(
                    new Date(order.orderDate).getTime() + 24 * 60 * 60 * 1000
                ).toISOString(),
                location: 'Warehouse',
            });
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            trackingInfo.updates.push({
                status: 'shipped',
                description: 'Order has been shipped',
                timestamp: new Date(
                    new Date(order.orderDate).getTime() + 2 * 24 * 60 * 60 * 1000
                ).toISOString(),
                location: 'Distribution Center',
            });
        }

        if (order.status === 'delivered') {
            trackingInfo.updates.push({
                status: 'delivered',
                description: 'Order has been delivered',
                timestamp: new Date(
                    new Date(order.orderDate).getTime() + 5 * 24 * 60 * 60 * 1000
                ).toISOString(),
                location: 'Destination',
            });
        }

        res.json(trackingInfo);
    } catch (error) {
        console.error('Get tracking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @route GET /api/orders/stats/summary
 * @desc Get order statistics for user
 * @access Private
 */
router.get('/stats/summary', (req, res) => {
    try {
        const userId = req.headers['user-id'] || 'demo-user';
        const userOrders = orders.filter(order => order.userId === userId);

        const stats = {
            totalOrders: userOrders.length,
            totalSpent: userOrders.reduce((sum, order) => sum + order.total, 0),
            ordersByStatus: {
                pending: userOrders.filter(o => o.status === 'pending').length,
                processing: userOrders.filter(o => o.status === 'processing').length,
                shipped: userOrders.filter(o => o.status === 'shipped').length,
                delivered: userOrders.filter(o => o.status === 'delivered').length,
                cancelled: userOrders.filter(o => o.status === 'cancelled').length,
            },
            recentOrders: userOrders
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                .slice(0, 5),
        };

        res.json(stats);
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
