const { createConnection } = require('../database/init');

class Settings {
    constructor() {
        this.db = createConnection();
    }

    // 获取所有设置
    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM settings ORDER BY key', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 转换为键值对对象
                    const settings = {};
                    rows.forEach(row => {
                        let value = row.value;
                        // 根据类型转换值
                        if (row.type === 'number') {
                            value = Number(value);
                        } else if (row.type === 'boolean') {
                            value = value === 'true';
                        } else if (row.type === 'json') {
                            try {
                                value = JSON.parse(value);
                            } catch (e) {
                                console.error('JSON解析失败:', e);
                            }
                        }
                        settings[row.key] = value;
                    });
                    resolve(settings);
                }
            });
        });
    }

    // 获取单个设置
    async get(key) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM settings WHERE key = ?', [key], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    let value = row.value;
                    // 根据类型转换值
                    if (row.type === 'number') {
                        value = Number(value);
                    } else if (row.type === 'boolean') {
                        value = value === 'true';
                    } else if (row.type === 'json') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.error('JSON解析失败:', e);
                        }
                    }
                    resolve(value);
                } else {
                    resolve(null);
                }
            });
        });
    }

    // 设置单个值
    async set(key, value, type = 'string', description = '') {
        // 根据类型转换值为字符串
        let stringValue = value;
        if (type === 'json') {
            stringValue = JSON.stringify(value);
        } else if (type === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else {
            stringValue = String(value);
        }

        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT OR REPLACE INTO settings (key, value, type, description, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `, [key, stringValue, type, description, new Date().toISOString()], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ key, value, type, description });
                }
            });
        });
    }

    // 批量更新设置
    async updateMultiple(settings) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                const stmt = this.db.prepare(`
                    INSERT OR REPLACE INTO settings (key, value, type, updated_at)
                    VALUES (?, ?, ?, ?)
                `);

                let completed = 0;
                const total = Object.keys(settings).length;
                const errors = [];

                for (const [key, value] of Object.entries(settings)) {
                    let type = 'string';
                    let stringValue = value;

                    // 自动检测类型
                    if (typeof value === 'number') {
                        type = 'number';
                        stringValue = String(value);
                    } else if (typeof value === 'boolean') {
                        type = 'boolean';
                        stringValue = value ? 'true' : 'false';
                    } else if (typeof value === 'object') {
                        type = 'json';
                        stringValue = JSON.stringify(value);
                    }

                    stmt.run([key, stringValue, type, new Date().toISOString()], (err) => {
                        completed++;
                        if (err) {
                            errors.push({ key, error: err.message });
                        }

                        if (completed === total) {
                            stmt.finalize();
                            if (errors.length > 0) {
                                reject(errors);
                            } else {
                                resolve({ updated: total });
                            }
                        }
                    });
                }
            });
        });
    }

    // 删除设置
    async delete(key) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM settings WHERE key = ?', [key], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ key, changes: this.changes });
                }
            });
        });
    }

    // 获取设置分组（根据key前缀）
    async getGroup(prefix) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM settings WHERE key LIKE ?', [`${prefix}%`], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const settings = {};
                    rows.forEach(row => {
                        let value = row.value;
                        if (row.type === 'number') {
                            value = Number(value);
                        } else if (row.type === 'boolean') {
                            value = value === 'true';
                        } else if (row.type === 'json') {
                            try {
                                value = JSON.parse(value);
                            } catch (e) {
                                console.error('JSON解析失败:', e);
                            }
                        }
                        settings[row.key] = value;
                    });
                    resolve(settings);
                }
            });
        });
    }

    // 关闭数据库连接
    close() {
        this.db.close();
    }
}

module.exports = Settings;