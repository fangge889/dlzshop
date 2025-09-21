const { createConnection } = require('../database/init');

class Media {
    constructor() {
        this.db = createConnection();
    }

    // 获取所有媒体文件
    async getAll(options = {}) {
        const { mime_type, limit, offset, search } = options;
        let query = `
            SELECT m.*, u.username as uploaded_by_name 
            FROM media m 
            LEFT JOIN users u ON m.uploaded_by = u.id
        `;
        const params = [];

        // 添加条件
        const conditions = [];
        if (mime_type) {
            conditions.push('m.mime_type LIKE ?');
            params.push(`${mime_type}%`);
        }
        if (search) {
            conditions.push('(m.original_name LIKE ? OR m.alt_text LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY m.created_at DESC';

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

    // 根据ID获取媒体文件
    async getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT m.*, u.username as uploaded_by_name 
                FROM media m 
                LEFT JOIN users u ON m.uploaded_by = u.id 
                WHERE m.id = ?
            `, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 创建媒体记录
    async create(mediaData) {
        const {
            filename, original_name, file_path, file_size, mime_type,
            width, height, alt_text, caption, uploaded_by
        } = mediaData;

        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO media (
                    filename, original_name, file_path, file_size, mime_type,
                    width, height, alt_text, caption, uploaded_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                filename, original_name, file_path, file_size, mime_type,
                width, height, alt_text, caption, uploaded_by
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...mediaData });
                }
            });
        });
    }

    // 更新媒体信息
    async update(id, mediaData) {
        const { alt_text, caption } = mediaData;

        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE media SET alt_text = ?, caption = ? WHERE id = ?
            `, [alt_text, caption, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 删除媒体记录
    async delete(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM media WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // 获取媒体统计信息
    async getStats() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    COUNT(*) as total_files,
                    SUM(file_size) as total_size,
                    COUNT(CASE WHEN mime_type LIKE 'image/%' THEN 1 END) as image_count,
                    COUNT(CASE WHEN mime_type LIKE 'video/%' THEN 1 END) as video_count,
                    COUNT(CASE WHEN mime_type LIKE 'audio/%' THEN 1 END) as audio_count
                FROM media
            `, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }

    // 关闭数据库连接
    close() {
        this.db.close();
    }
}

module.exports = Media;