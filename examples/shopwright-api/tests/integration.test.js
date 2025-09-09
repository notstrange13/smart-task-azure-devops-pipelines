const request = require('supertest');
const app = require('../src/index');

describe('Health Check and API Info', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('version');
        });
    });

    describe('GET /api', () => {
        it('should return API information', async () => {
            const response = await request(app).get('/api');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('description');
            expect(response.body).toHaveProperty('endpoints');
            expect(Array.isArray(response.body.endpoints)).toBe(true);
        });
    });

    describe('404 Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app).get('/non-existent-route');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Not Found');
            expect(response.body).toHaveProperty('message', 'The requested resource was not found');
        });
    });
});

describe('API Integration Tests', () => {
    const userId = 'integration-test-user';

    describe('Complete E-commerce Flow', () => {
        it('should complete full shopping flow', async () => {
            // 1. Get products
            const productsResponse = await request(app).get('/api/products');

            expect(productsResponse.status).toBe(200);
            expect(productsResponse.body.products.length).toBeGreaterThan(0);

            const product = productsResponse.body.products[0];

            // 2. Add product to cart
            const addToCartResponse = await request(app)
                .post('/api/cart/add')
                .set('user-id', userId)
                .send({
                    productId: product.id,
                    quantity: 2,
                    price: product.price,
                });

            expect(addToCartResponse.status).toBe(200);
            expect(addToCartResponse.body.cart.items).toHaveLength(1);

            // 3. Get cart
            const cartResponse = await request(app).get('/api/cart').set('user-id', userId);

            expect(cartResponse.status).toBe(200);
            expect(cartResponse.body.items).toHaveLength(1);
            expect(cartResponse.body.total).toBe(product.price * 2);

            // 4. Create order
            const orderResponse = await request(app)
                .post('/api/orders')
                .set('user-id', userId)
                .send({
                    items: cartResponse.body.items,
                    shippingAddress: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'TS',
                        zipCode: '12345',
                        country: 'Test Country',
                    },
                    paymentMethod: {
                        type: 'credit_card',
                        last4: '1234',
                    },
                    total: cartResponse.body.total,
                });

            expect(orderResponse.status).toBe(201);
            expect(orderResponse.body.order).toHaveProperty('id');
            expect(orderResponse.body.order.status).toBe('pending');

            // 5. Get order tracking
            const trackingResponse = await request(app)
                .get(`/api/orders/${orderResponse.body.order.id}/tracking`)
                .set('user-id', userId);

            expect(trackingResponse.status).toBe(200);
            expect(trackingResponse.body).toHaveProperty('trackingNumber');
            expect(trackingResponse.body).toHaveProperty('updates');
            expect(Array.isArray(trackingResponse.body.updates)).toBe(true);

            // 6. Get order stats
            const statsResponse = await request(app)
                .get('/api/orders/stats/summary')
                .set('user-id', userId);

            expect(statsResponse.status).toBe(200);
            expect(statsResponse.body.totalOrders).toBe(1);
            expect(statsResponse.body.totalSpent).toBe(cartResponse.body.total);
        });

        it('should handle authentication flow', async () => {
            // 1. Register new user
            const registerResponse = await request(app).post('/api/auth/register').send({
                email: 'integration@test.com',
                password: 'password123',
                name: 'Integration Test User',
            });

            expect(registerResponse.status).toBe(201);
            expect(registerResponse.body).toHaveProperty('token');
            expect(registerResponse.body.user.email).toBe('integration@test.com');

            // 2. Login with registered user
            const loginResponse = await request(app).post('/api/auth/login').send({
                email: 'integration@test.com',
                password: 'password123',
            });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty('token');
            expect(loginResponse.body.user.email).toBe('integration@test.com');

            // 3. Logout
            const logoutResponse = await request(app).post('/api/auth/logout');

            expect(logoutResponse.status).toBe(200);
            expect(logoutResponse.body.message).toBe('Logout successful');
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle cart operations with non-existent products', async () => {
            // Try to add non-existent product to cart
            const response = await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 99999,
                quantity: 1,
                price: 100,
            });

            // Should still work since we're not validating product existence in this demo
            expect(response.status).toBe(200);
        });

        it('should handle order creation with invalid data', async () => {
            const response = await request(app).post('/api/orders').set('user-id', userId).send({
                // Missing required fields
                items: [],
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Missing required fields');
        });

        it('should handle order cancellation edge cases', async () => {
            // Create an order first
            const orderResponse = await request(app)
                .post('/api/orders')
                .set('user-id', userId)
                .send({
                    items: [
                        {
                            productId: 1,
                            quantity: 1,
                            price: 100,
                        },
                    ],
                    shippingAddress: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'TS',
                        zipCode: '12345',
                        country: 'Test Country',
                    },
                    paymentMethod: {
                        type: 'credit_card',
                        last4: '1234',
                    },
                    total: 100,
                });

            const orderId = orderResponse.body.order.id;

            // Cancel the order
            const cancelResponse = await request(app)
                .put(`/api/orders/${orderId}/cancel`)
                .set('user-id', userId);

            expect(cancelResponse.status).toBe(200);
            expect(cancelResponse.body.order.status).toBe('cancelled');

            // Try to cancel again (should fail)
            const secondCancelResponse = await request(app)
                .put(`/api/orders/${orderId}/cancel`)
                .set('user-id', userId);

            expect(secondCancelResponse.status).toBe(400);
            expect(secondCancelResponse.body.message).toContain('Cannot cancel order');
        });
    });
});
