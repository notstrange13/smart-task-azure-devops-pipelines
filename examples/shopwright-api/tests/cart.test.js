const request = require('supertest');
const app = require('../src/index');

describe('Cart Endpoints', () => {
    const userId = 'test-user';

    beforeEach(() => {
        // Clear cart before each test
        return request(app).delete('/api/cart/clear').set('user-id', userId);
    });

    describe('GET /api/cart', () => {
        it('should get empty cart for new user', async () => {
            const response = await request(app).get('/api/cart').set('user-id', userId);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('total');
            expect(response.body.items).toEqual([]);
            expect(response.body.total).toBe(0);
        });
    });

    describe('POST /api/cart/add', () => {
        it('should add item to cart successfully', async () => {
            const item = {
                productId: 1,
                quantity: 2,
                price: 299.99,
            };

            const response = await request(app)
                .post('/api/cart/add')
                .set('user-id', userId)
                .send(item);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('cart');
            expect(response.body.cart.items).toHaveLength(1);
            expect(response.body.cart.items[0].productId).toBe(item.productId);
            expect(response.body.cart.items[0].quantity).toBe(item.quantity);
            expect(response.body.cart.total).toBe(item.price * item.quantity);
        });

        it('should update quantity if item already exists in cart', async () => {
            const item = {
                productId: 1,
                quantity: 1,
                price: 299.99,
            };

            // Add item first time
            await request(app).post('/api/cart/add').set('user-id', userId).send(item);

            // Add same item again
            const response = await request(app)
                .post('/api/cart/add')
                .set('user-id', userId)
                .send(item);

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toHaveLength(1);
            expect(response.body.cart.items[0].quantity).toBe(2);
            expect(response.body.cart.total).toBe(item.price * 2);
        });

        it('should fail with missing productId', async () => {
            const response = await request(app).post('/api/cart/add').set('user-id', userId).send({
                quantity: 1,
                price: 299.99,
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Product ID and price are required');
        });

        it('should fail with missing price', async () => {
            const response = await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 1,
                quantity: 1,
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Product ID and price are required');
        });
    });

    describe('PUT /api/cart/update', () => {
        beforeEach(async () => {
            // Add item to cart for testing updates
            await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 1,
                quantity: 2,
                price: 299.99,
            });
        });

        it('should update item quantity successfully', async () => {
            const response = await request(app)
                .put('/api/cart/update')
                .set('user-id', userId)
                .send({
                    productId: 1,
                    quantity: 5,
                });

            expect(response.status).toBe(200);
            expect(response.body.cart.items[0].quantity).toBe(5);
            expect(response.body.cart.total).toBe(299.99 * 5);
        });

        it('should remove item when quantity is 0', async () => {
            const response = await request(app)
                .put('/api/cart/update')
                .set('user-id', userId)
                .send({
                    productId: 1,
                    quantity: 0,
                });

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toHaveLength(0);
            expect(response.body.cart.total).toBe(0);
        });

        it('should return 404 for non-existent item', async () => {
            const response = await request(app)
                .put('/api/cart/update')
                .set('user-id', userId)
                .send({
                    productId: 999,
                    quantity: 1,
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Item not found in cart');
        });
    });

    describe('DELETE /api/cart/remove/:productId', () => {
        beforeEach(async () => {
            // Add items to cart for testing removal
            await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 1,
                quantity: 2,
                price: 299.99,
            });

            await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 2,
                quantity: 1,
                price: 199.99,
            });
        });

        it('should remove item from cart successfully', async () => {
            const response = await request(app).delete('/api/cart/remove/1').set('user-id', userId);

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toHaveLength(1);
            expect(response.body.cart.items[0].productId).toBe(2);
            expect(response.body.cart.total).toBe(199.99);
        });

        it('should return 404 for non-existent item', async () => {
            const response = await request(app)
                .delete('/api/cart/remove/999')
                .set('user-id', userId);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Item not found in cart');
        });
    });

    describe('DELETE /api/cart/clear', () => {
        beforeEach(async () => {
            // Add items to cart for testing clear
            await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 1,
                quantity: 2,
                price: 299.99,
            });
        });

        it('should clear cart successfully', async () => {
            const response = await request(app).delete('/api/cart/clear').set('user-id', userId);

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toEqual([]);
            expect(response.body.cart.total).toBe(0);
        });
    });

    describe('GET /api/cart/count', () => {
        it('should return 0 for empty cart', async () => {
            const response = await request(app).get('/api/cart/count').set('user-id', userId);

            expect(response.status).toBe(200);
            expect(response.body.count).toBe(0);
        });

        it('should return correct item count', async () => {
            // Add items to cart
            await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 1,
                quantity: 2,
                price: 299.99,
            });

            await request(app).post('/api/cart/add').set('user-id', userId).send({
                productId: 2,
                quantity: 3,
                price: 199.99,
            });

            const response = await request(app).get('/api/cart/count').set('user-id', userId);

            expect(response.status).toBe(200);
            expect(response.body.count).toBe(5); // 2 + 3
        });
    });
});
