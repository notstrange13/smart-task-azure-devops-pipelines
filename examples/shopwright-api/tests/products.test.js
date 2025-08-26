const request = require('supertest');
const app = require('../src/index');

describe('Products Endpoints', () => {
  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics');

      expect(response.status).toBe(200);
      expect(response.body.products.every(p => p.category === 'Electronics')).toBe(true);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=100&maxPrice=300');

      expect(response.status).toBe(200);
      expect(response.body.products.every(p => p.price >= 100 && p.price <= 300)).toBe(true);
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=headphones');

      expect(response.status).toBe(200);
      expect(response.body.products.some(p => 
        p.name.toLowerCase().includes('headphones') || 
        p.description.toLowerCase().includes('headphones')
      )).toBe(true);
    });

    it('should sort products by price ascending', async () => {
      const response = await request(app)
        .get('/api/products?sort=price-asc');

      expect(response.status).toBe(200);
      const prices = response.body.products.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should sort products by price descending', async () => {
      const response = await request(app)
        .get('/api/products?sort=price-desc');

      expect(response.status).toBe(200);
      const prices = response.body.products.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(2);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get single product by ID', async () => {
      const response = await request(app)
        .get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('GET /api/products/category/:category', () => {
    it('should get products by category', async () => {
      const response = await request(app)
        .get('/api/products/category/Electronics');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every(p => p.category === 'Electronics')).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/products/category/NonExistentCategory');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No products found in this category');
    });
  });

  describe('POST /api/products', () => {
    it('should create new product with valid data', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test product description',
        price: 99.99,
        category: 'Test Category',
        stock: 10,
        brand: 'Test Brand'
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(newProduct.name);
      expect(response.body.product.price).toBe(newProduct.price);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product'
          // missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update existing product', async () => {
      const updates = {
        name: 'Updated Product Name',
        price: 199.99
      };

      const response = await request(app)
        .put('/api/products/1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(updates.name);
      expect(response.body.product.price).toBe(updates.price);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/999')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete existing product', async () => {
      const response = await request(app)
        .delete('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product deleted successfully');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found');
    });
  });
});
