// tests/login.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/server.js';

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Pre-register users for login tests
  await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'user@test.com',
    password: 'Password123',
    role: 'user'
  });

  await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Password123',
    role: 'adminuser'
  });

  await request(app).post('/api/drivers/register').send({
    name: 'Test Driver',
    surname: 'Driver',
    email: 'driver@test.com',
    password: 'Password123',
    carModel: 'Toyota Corolla',
    carPlate: 'ABC123',
    driverLicense: 'DL123456',
    idNumber: '1234567890123',
    phoneNumber: '0721234567',
    planType: 'subscription'
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Login Tests', () => {

  // -------------------------
  // Normal User Login
  // -------------------------
  it('should login a normal user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'Password123'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'user@test.com');
    expect(res.body.user).toHaveProperty('role', 'user');
  });

  // -------------------------
  // Admin User Login
  // -------------------------
  it('should login an admin user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Password123'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'admin@test.com');
    expect(res.body.user).toHaveProperty('role', 'adminuser');
  });

  // -------------------------
  // Driver Login
  // -------------------------
  it('should login a driver successfully', async () => {
    const res = await request(app)
      .post('/api/drivers/login')
      .send({
        email: 'driver@test.com',
        password: 'Password123'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.driver).toHaveProperty('email', 'driver@test.com');
    expect(res.body.driver).toHaveProperty('status', 'active');
  });

  // -------------------------
  // Invalid credentials
  // -------------------------
  it('should fail login with wrong password', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'wrongpass' })
      .expect(400);

    await request(app)
      .post('/api/drivers/login')
      .send({ email: 'driver@test.com', password: 'wrongpass' })
      .expect(400);
  });

  it('should fail login with unregistered email', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'notfound@test.com', password: 'Password123' })
      .expect(400);

    await request(app)
      .post('/api/drivers/login')
      .send({ email: 'notfound@test.com', password: 'Password123' })
      .expect(400);
  });
});
