const request = require('supertest');
const app = require('../src/index');

describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'admin@demo.com',
                password: 'password123',
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('admin@demo.com');
        });

        it('should fail with invalid credentials', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'admin@demo.com',
                password: 'wrongpassword',
            });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should fail with missing email', async () => {
            const response = await request(app).post('/api/auth/login').send({
                password: 'password123',
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email and password are required');
        });

        it('should fail with missing password', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'admin@demo.com',
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email and password are required');
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register new user successfully', async () => {
            const response = await request(app).post('/api/auth/register').send({
                email: 'newuser@test.com',
                password: 'password123',
                name: 'New User',
            });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('newuser@test.com');
        });

        it('should fail with existing email', async () => {
            const response = await request(app).post('/api/auth/register').send({
                email: 'admin@demo.com',
                password: 'password123',
                name: 'Test User',
            });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('User already exists');
        });

        it('should fail with missing fields', async () => {
            const response = await request(app).post('/api/auth/register').send({
                email: 'test@test.com',
                // missing password and name
            });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('All fields are required');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await request(app).post('/api/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logout successful');
        });
    });
});
