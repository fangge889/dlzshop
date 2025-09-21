const { createConnection } = require('../database/init');

class Page {
    constructor() {
        this.db = createConnection();
    }

    // 获取所有页面
    async getAll(options = {}) {
        const { status, limit, offset, search } = options;
        let query = `
            SELECT p.*, u.username as author_name 
            FROM pages p 
            LEFT JOIN users u ON p.author_id = u.id
        `;
        const params = [];

        // 添加条件
        const conditions = [];
        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }
        if (search) {
            conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.updated_at DESC';

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

    // 根据ID获取页面
    async getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT p.*, u.username as author_name 
                FROM pages p 
                LEFT JOIN users u ON p.author_id = u.id 
                WHERE p.id = ?
            `, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 根据page_id获取页面
    async getByPageId(pageId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT p.*, u.username as author_name 
                FROM pages p 
                LEFT JOIN users u ON p.author_id = u.id 
                WHERE p.page_id = ?
            `, [pageId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 创建页面
    async create(pageData) {
        const {
            page_id, title, slug, content, excerpt, layout, template,
            status, author_id, featured_image, meta_title, meta_description,
            meta_keywords, published_at
        } = pageData;

        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO pages (
                    page_id, title, slug, content, excerpt, layout, template,
                    status, author_id, featured_image, meta_title, meta_description,
                    meta_keywords, published_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                page_id, title, slug || page_id, content, excerpt, layout || 'page',
                template, status || 'draft', author_id, featured_image,
                meta_title, meta_description, meta_keywords, published_at,
                new Date().toISOString(), new Date().toISOString()
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...pageData });
                }
            });
        });
    }

    // 更新页面
    async update(id, pageData) {
        const {
            title, slug, content, excerpt, layout, template,
            status, featured_image, meta_title, meta_description,
            meta_keywords, published_at
        } = pageData;

        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE pages SET
                    title = ?, slug = ?, content = ?, excerpt = ?, layout = ?,
                    template = ?, status = ?, featured_image = ?, meta_title = ?,
                    meta_description = ?, meta_keywords = ?, published_at = ?,
                    updated_at = ?
                WHERE id = ?
            `, [
                title, slug, content, excerpt, layout, template, status,
                featured_image, meta_title, meta_description, meta_keywords,
                published_at, new Date().toISOString(), id
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 删除页面
    async delete(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM pages WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 发布页面
    async publish(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE pages SET 
                    status = 'published', 
                    published_at = ?, 
                    updated_at = ?
                WHERE id = ?
            `, [new Date().toISOString(), new Date().toISOString(), id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 取消发布
    async unpublish(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE pages SET 
                    status = 'draft', 
                    published_at = NULL, 
                    updated_at = ?
                WHERE id = ?
            `, [new Date().toISOString(), id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 保存页面版本
    async saveVersion(pageId, versionData) {
        const { title, content, author_id } = versionData;
        
        return new Promise((resolve, reject) => {
            // 先获取当前版本号
            this.db.get(`
                SELECT MAX(version_number) as max_version 
                FROM page_versions 
                WHERE page_id = ?
            `, [pageId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                const nextVersion = (row.max_version || 0) + 1;

                this.db.run(`
                    INSERT INTO page_versions (page_id, version_number, title, content, author_id)
                    VALUES (?, ?, ?, ?, ?)
                `, [pageId, nextVersion, title, content, author_id], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, version: nextVersion });
                    }
                });
            });
        });
    }

    // 获取页面版本历史
    async getVersions(pageId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT pv.*, u.username as author_name
                FROM page_versions pv
                LEFT JOIN users u ON pv.author_id = u.id
                WHERE pv.page_id = ?
                ORDER BY pv.version_number DESC
            `, [pageId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 关闭数据库连接
    close() {
        this.db.close();
    }
}

module.exports = Page;