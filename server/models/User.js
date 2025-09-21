const { createConnection } = require('../database/init');
const bcrypt = require('bcryptjs');

class User {
    constructor() {
        this.db = createConnection();
    }

    // 获取所有用户
    async getAll(options = {}) {
        const { role, limit, offset, search } = options;
        let query = 'SELECT id, username, email, role, avatar_url, created_at, updated_at, last_login, is_active FROM users';
        const params = [];

        // 添加条件
        const conditions = [];
        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }
        if (search) {
            conditions.push('(username LIKE ? OR email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        if (limit) {
            query += ' LIMIT ?';
            params.push(limit);
            if (offset) {
                query += ' OFFSET ?';
                params.push(offset);
            }
        }

        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 根据ID获取用户
    async getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT id, username, email, role, avatar_url, created_at, updated_at, last_login, is_active 
                FROM users WHERE id = ?
            `, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 根据用户名获取用户（包含密码，用于登录验证）
    async getByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 根据邮箱获取用户
    async getByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 创建用户
    async create(userData) {
        const { username, email, password, role = 'editor', avatar_url } = userData;
        const password_hash = await bcrypt.hash(password, 10);

        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO users (username, email, password_hash, role, avatar_url)
                VALUES (?, ?, ?, ?, ?)
            `, [username, email, password_hash, role, avatar_url], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username, email, role });
                }
            });
        });
    }

    // 更新用户
    async update(id, userData) {
        const { username, email, role, avatar_url, is_active } = userData;

        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE users SET 
                    username = ?, email = ?, role = ?, avatar_url = ?, 
                    is_active = ?, updated_at = ?
                WHERE id = ?
            `, [username, email, role, avatar_url, is_active, new Date().toISOString(), id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 更新密码
    async updatePassword(id, newPassword) {
        const password_hash = await bcrypt.hash(newPassword, 10);

        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?
            `, [password_hash, new Date().toISOString(), id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 验证密码
    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    // 更新最后登录时间
    async updateLastLogin(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE users SET last_login = ? WHERE id = ?
            `, [new Date().toISOString(), id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 删除用户
    async delete(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 关闭数据库连接
    close() {
        this.db.close();
    }
}

module.exports = User;