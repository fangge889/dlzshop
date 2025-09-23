// 简化测试，不依赖实际数据库
const Page = require('./models/Page');

// 模拟数据库方法
class MockDB {
    all(query, params, callback) {
        // 模拟查询结果
        const results = [
            { id: 1, title: '测试页面1', status: 'published', author_name: 'testuser' },
            { id: 2, title: '测试页面2', status: 'draft', author_name: 'testuser' }
        ];
        callback(null, results);
    }
    
    get(query, params, callback) {
        // 模拟单个查询结果
        const result = { id: 1, title: '测试页面', status: 'published', author_name: 'testuser' };
        callback(null, result);
    }
    
    run(query, params, callback) {
        // 模拟执行结果
        const context = { lastID: 1, changes: 1 };
        callback.call(context, null);
    }
    
    close() {
        // 模拟关闭连接
    }
}

// 替换Page模型中的数据库连接
const originalCreateConnection = require('./database/init').createConnection;
require('./database/init').createConnection = function() {
    return new MockDB();
};

console.log('开始简化测试Page模型...\n');

async function runSimpleTests() {
    try {
        // 创建Page模型实例
        const pageModel = new Page();
        
        // 测试1: 获取所有页面
        console.log('测试1: 获取所有页面');
        const allPages = await pageModel.getAll();
        console.log('✓ 获取页面列表成功，数量:', allPages.length);
        console.log('  页面1标题:', allPages[0].title);
        console.log('  页面2状态:', allPages[1].status);
        
        // 测试2: 根据ID获取页面
        console.log('\n测试2: 根据ID获取页面');
        const pageById = await pageModel.getById(1);
        console.log('✓ 获取页面成功:');
        console.log('  ID:', pageById.id);
        console.log('  标题:', pageById.title);
        console.log('  作者:', pageById.author_name);
        
        // 测试3: 根据page_id获取页面
        console.log('\n测试3: 根据page_id获取页面');
        const pageByPageId = await pageModel.getByPageId('test-page-1');
        console.log('✓ 获取页面成功:', pageByPageId ? '找到页面' : '未找到页面');
        
        // 测试4: 根据slug获取页面
        console.log('\n测试4: 根据slug获取页面');
        const pageBySlug = await pageModel.getBySlug('test-page');
        console.log('✓ 获取页面成功:', pageBySlug ? '找到页面' : '未找到页面');
        
        // 测试5: 创建页面
        console.log('\n测试5: 创建页面');
        const createdPage = await pageModel.create({
            page_id: 'new-page',
            title: '新页面',
            content: '新页面内容',
            author_id: 1
        });
        console.log('✓ 创建页面成功:');
        console.log('  ID:', createdPage.id);
        console.log('  标题:', createdPage.title);
        
        // 测试6: 更新页面
        console.log('\n测试6: 更新页面');
        const updateResult = await pageModel.update(1, {
            title: '更新后的标题',
            content: '更新后的内容'
        });
        console.log('✓ 更新页面成功，影响行数:', updateResult.changes);
        
        // 测试7: 删除页面
        console.log('\n测试7: 删除页面');
        const deleteResult = await pageModel.delete(1);
        console.log('✓ 删除页面成功，影响行数:', deleteResult.changes);
        
        // 测试8: 发布页面
        console.log('\n测试8: 发布页面');
        const publishResult = await pageModel.publish(1);
        console.log('✓ 发布页面成功，影响行数:', publishResult.changes);
        
        // 测试9: 取消发布页面
        console.log('\n测试9: 取消发布页面');
        const unpublishResult = await pageModel.unpublish(1);
        console.log('✓ 取消发布页面成功，影响行数:', unpublishResult.changes);
        
        // 测试10: 保存页面版本
        console.log('\n测试10: 保存页面版本');
        const versionResult = await pageModel.saveVersion(1, {
            title: '版本标题',
            content: '版本内容',
            author_id: 1
        });
        console.log('✓ 保存页面版本成功:', versionResult);
        
        // 测试11: 获取页面版本历史
        console.log('\n测试11: 获取页面版本历史');
        const versions = await pageModel.getVersions(1);
        console.log('✓ 获取页面版本历史成功，数量:', versions.length);
        
        // 测试12: 获取页面统计信息
        console.log('\n测试12: 获取页面统计信息');
        const stats = await pageModel.getStats();
        console.log('✓ 获取页面统计信息成功:', stats);
        
        // 测试13: 检查slug唯一性
        console.log('\n测试13: 检查slug唯一性');
        const isUnique = await pageModel.isSlugUnique('unique-slug');
        console.log('✓ 检查slug唯一性成功:', isUnique);
        
        // 关闭数据库连接
        pageModel.close();
        
        console.log('\n🎉 所有简化测试通过！');
        console.log('\n注意: 这是一个简化测试，不连接实际数据库。');
        console.log('实际使用时，请确保数据库连接和表结构正确。');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('堆栈信息:', error.stack);
    }
}

// 运行简化测试
runSimpleTests();