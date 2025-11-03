// tests/registration.test.js
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
});

afterAll(async () => {
  await mongoose.connection.dropDatabase(); // clean up test DB
  await mongoose.connection.close();
});

describe('Registration Tests', () => {

  // -------------------------
  // Normal User Registration
  // -------------------------
  it('should register a normal app user', async () => {
    const payload = {
      name: 'Test User',
      email: `user${Date.now()}@test.com`,
      password: 'Password123',
      role: 'user'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('role', 'user');
    expect(res.body.user).toHaveProperty('email', payload.email);
  });

  // -------------------------
  // Admin User Registration
  // -------------------------
  it('should register an admin user', async () => {
    const payload = {
      name: 'Admin User',
      email: `admin${Date.now()}@test.com`,
      password: 'Password123',
      role: 'adminuser'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('role', 'adminuser');
    expect(res.body.user).toHaveProperty('email', payload.email);
  });

  // -------------------------
  // Driver Registration
  // -------------------------
  it('should register a driver', async () => {
    const payload = {
      name: 'Test Driver',
      surname: 'Driver',
      email: `driver${Date.now()}@test.com`,
      password: 'Password123',
      carModel: 'Toyota Corolla',
      carPlate: 'ABC123',
      driverLicense: 'DL123456',
      idNumber: '1234567890123',
      phoneNumber: '0721234567',
      planType: 'subscription'
    };

    const res = await request(app)
      .post('/api/drivers/register')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('msg', 'Driver registered, pending admin approval');
    expect(res.body.driver).toHaveProperty('id');
    expect(res.body.driver).toHaveProperty('status', 'active');
  });

});
