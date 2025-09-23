const Page = require('./Page');
const { createConnection } = require('../database/init');

// 创建测试数据库连接
function createTestConnection() {
    return createConnection();
}

// 初始化测试数据
async function setupTestData() {
    const db = createTestConnection();
    
    // 清空测试数据
    await new Promise((resolve) => {
        db.run('DELETE FROM page_versions', () => {
            db.run('DELETE FROM pages', () => {
                db.run('DELETE FROM users', () => {
                    resolve();
                });
            });
        });
    });
    
    // 插入测试用户
    await new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO users (username, email, password_hash, role) 
            VALUES ('testuser', 'test@example.com', 'hash123', 'editor')
        `, function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
    
    db.close();
}

// 清理测试数据
async function cleanupTestData() {
    const db = createTestConnection();
    
    await new Promise((resolve) => {
        db.run('DELETE FROM page_versions', () => {
            db.run('DELETE FROM pages', () => {
                db.run('DELETE FROM users', () => {
                    resolve();
                });
            });
        });
    });
    
    db.close();
}

describe('Page Model Tests', () => {
    let pageModel;
    
    beforeAll(async () => {
        await setupTestData();
        pageModel = new Page();
    });
    
    afterAll(async () => {
        pageModel.close();
        await cleanupTestData();
    });
    
    test('should create a new page', async () => {
        const pageData = {
            page_id: 'test-page-1',
            title: 'Test Page',
            content: 'This is a test page content',
            author_id: 1
        };
        
        const result = await pageModel.create(pageData);
        
        expect(result).toHaveProperty('id');
        expect(result.title).toBe(pageData.title);
        expect(result.page_id).toBe(pageData.page_id);
    });
    
    test('should get page by id', async () => {
        // 先创建一个页面
        const pageData = {
            page_id: 'test-page-2',
            title: 'Test Page 2',
            content: 'This is another test page',
            author_id: 1
        };
        
        const createdPage = await pageModel.create(pageData);
        const fetchedPage = await pageModel.getById(createdPage.id);
        
        expect(fetchedPage).toBeDefined();
        expect(fetchedPage.title).toBe(pageData.title);
        expect(fetchedPage.author_name).toBe('testuser'); // 关联的用户名
    });
    
    test('should get page by page_id', async () => {
        const pageId = 'test-page-3';
        const pageData = {
            page_id: pageId,
            title: 'Test Page 3',
            content: 'Content for test page 3',
            author_id: 1
        };
        
        await pageModel.create(pageData);
        const fetchedPage = await pageModel.getByPageId(pageId);
        
        expect(fetchedPage).toBeDefined();
        expect(fetchedPage.page_id).toBe(pageId);
        expect(fetchedPage.title).toBe(pageData.title);
    });
    
    test('should get page by slug', async () => {
        const pageData = {
            page_id: 'test-page-4',
            title: 'Test Page 4',
            slug: 'test-page-4',
            content: 'Content for test page 4',
            author_id: 1
        };
        
        await pageModel.create(pageData);
        const fetchedPage = await pageModel.getBySlug('test-page-4');
        
        expect(fetchedPage).toBeDefined();
        expect(fetchedPage.slug).toBe('test-page-4');
        expect(fetchedPage.title).toBe(pageData.title);
    });
    
    test('should get all pages', async () => {
        const pages = await pageModel.getAll();
        
        expect(Array.isArray(pages)).toBe(true);
        expect(pages.length).toBeGreaterThan(0);
    });
    
    test('should get all pages with filters', async () => {
        const pages = await pageModel.getAll({
            status: 'draft',
            limit: 10,
            offset: 0
        });
        
        expect(Array.isArray(pages)).toBe(true);
    });
    
    test('should update a page', async () => {
        // 创建页面
        const pageData = {
            page_id: 'test-page-5',
            title: 'Original Title',
            content: 'Original content',
            author_id: 1
        };
        
        const createdPage = await pageModel.create(pageData);
        
        // 更新页面
        const updateData = {
            title: 'Updated Title',
            content: 'Updated content'
        };
        
        const result = await pageModel.update(createdPage.id, updateData);
        
        expect(result.changes).toBe(1);
        
        // 验证更新
        const updatedPage = await pageModel.getById(createdPage.id);
        expect(updatedPage.title).toBe('Updated Title');
        expect(updatedPage.content).toBe('Updated content');
    });
    
    test('should publish a page', async () => {
        // 创建页面
        const pageData = {
            page_id: 'test-page-6',
            title: 'Page to Publish',
            content: 'Content to publish',
            author_id: 1
        };
        
        const createdPage = await pageModel.create(pageData);
        
        // 发布页面
        const result = await pageModel.publish(createdPage.id);
        
        expect(result.changes).toBe(1);
        
        // 验证发布状态
        const publishedPage = await pageModel.getById(createdPage.id);
        expect(publishedPage.status).toBe('published');
        expect(publishedPage.published_at).not.toBeNull();
    });
    
    test('should unpublish a page', async () => {
        // 创建页面并发布
        const pageData = {
            page_id: 'test-page-7',
            title: 'Page to Unpublish',
            content: 'Content to unpublish',
            author_id: 1,
            status: 'published',
            published_at: new Date().toISOString()
        };
        
        const createdPage = await pageModel.create(pageData);
        
        // 取消发布
        const result = await pageModel.unpublish(createdPage.id);
        
        expect(result.changes).toBe(1);
        
        // 验证取消发布状态
        const unpublishedPage = await pageModel.getById(createdPage.id);
        expect(unpublishedPage.status).toBe('draft');
        expect(unpublishedPage.published_at).toBeNull();
    });
    
    test('should save and get page versions', async () => {
        // 创建页面
        const pageData = {
            page_id: 'test-page-8',
            title: 'Versioned Page',
            content: 'Original content',
            author_id: 1
        };
        
        const createdPage = await pageModel.create(pageData);
        
        // 保存版本
        const versionData = {
            title: 'Versioned Page',
            content: 'Version 1 content',
            author_id: 1
        };
        
        const versionResult = await pageModel.saveVersion(createdPage.id, versionData);
        
        expect(versionResult).toHaveProperty('version', 1);
        
        // 获取版本历史
        const versions = await pageModel.getVersions(createdPage.id);
        
        expect(Array.isArray(versions)).toBe(true);
        expect(versions.length).toBe(1);
        expect(versions[0].version_number).toBe(1);
    });
    
    test('should get page stats', async () => {
        const stats = await pageModel.getStats();
        
        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('published');
        expect(stats).toHaveProperty('draft');
        expect(typeof stats.total).toBe('number');
    });
    
    test('should check slug uniqueness', async () => {
        // 创建页面
        const pageData = {
            page_id: 'test-page-9',
            title: 'Unique Slug Test',
            slug: 'unique-slug-test',
            content: 'Content for slug test',
            author_id: 1
        };
        
        await pageModel.create(pageData);
        
        // 检查唯一性
        const isUnique = await pageModel.isSlugUnique('another-slug');
        const isNotUnique = await pageModel.isSlugUnique('unique-slug-test');
        
        expect(isUnique).toBe(true);
        expect(isNotUnique).toBe(false);
    });
    
    test('should delete a page', async () => {
        // 创建页面
        const pageData = {
            page_id: 'test-page-10',
            title: 'Page to Delete',
            content: 'Content to delete',
            author_id: 1
        };
        
        const createdPage = await pageModel.create(pageData);
        
        // 删除页面
        const result = await pageModel.delete(createdPage.id);
        
        expect(result.changes).toBe(1);
        
        // 验证删除
        const deletedPage = await pageModel.getById(createdPage.id);
        expect(deletedPage).toBeUndefined();
    });
});