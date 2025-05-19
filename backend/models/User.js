const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('../config/db');

class User {
  static async findByEmail(email) {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      connection.end();
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      connection.end();
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { name, email, password, role = 'user' } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const connection = await mysql.createConnection(config);
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      connection.end();
      
      return {
        id: result.insertId,
        name,
        email,
        role
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User; 