// tests/user.test.js

const request = require('supertest');
const app = require('../server');
const User = require('../models/User'); // Import the User model
const mongoose = require('mongoose'); // Import mongoose for cleanup
const {ROLE} = require('../config/constant')

const jwt = require('jsonwebtoken');
const JWT_KEY = require("../config/key");

function generateTestToken(user) {
    return jwt.sign({ email: user.email, role: user.role }, 'secret');
}
describe('PUT /api/user/me/update-email/:id', () => { // Use the correct route structure
  let userId;

  beforeAll(async () => {

    console.log("Before all tests, I am running")
    // Create a test user in the database before running tests
    const user = await User.create({
      username: 'testuser',
      email: 'oldemail@example.com',
      password: 'password123',
      role: ROLE.CUSTOMER,
      wallet_address: 'unique_wallet_address_123', // Ensure this is unique
      nonce: 'unique_nonce_456' // Ensure this is unique
    });

    userId = user._id; // Store the created user's ID for testing
  });

  afterAll(async () => {
    // Clean up after tests
    await User.deleteMany({}); // Remove test users or handle cleanup as needed
    // Close the MongoDB connection
    await mongoose.connection.close();
  });

  it('should update the user email with a valid email', async () => {
    const validEmail = 'test@example.com';
     const token = generateTestToken({ email: 'oldemail@example.com', role: ROLE.CUSTOMER })

    const response = await request(app) // Use server instead of app
      .put(`/api/user/me/update-email/${userId}`) // Correctly using the defined route
      .set('Authorization', `Bearer ${token}`)
      .send({ email: validEmail });

    expect(response.status).toBe(200);
    expect(response.body.updatedUser.email).toBe(validEmail);
  });

  it('should return an error for an invalid email format', async () => {
    const invalidEmail = 'invalid-email';
     const token = generateTestToken({ email: 'oldemail@example.com', role: ROLE.CUSTOMER })

    const response = await request(app) // Use server instead of app
      .put(`/api/user/me/update-email/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: invalidEmail });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid email format');
  });
});