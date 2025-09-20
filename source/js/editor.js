// 页面编辑器JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get('id');
    
    // 如果有页面ID，加载现有页面数据
    if (pageId) {
        loadPageData(pageId);
    }
    
    // 绑定事件
    document.getElementById('save-page').addEventListener('click', savePage);
    document.getElementById('preview-page').addEventListener('click', previewPage);
    document.getElementById('publish-page').addEventListener('click', publishPage);
    
    // 预览模态框关闭事件
    const modal = document.getElementById('preview-modal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// 加载页面数据
function loadPageData(pageId) {
    fetch(`/api/pages/${pageId}`)
        .then(response => response.json())
        .then(page => {
            document.getElementById('page-title').value = page.title || '';
            document.getElementById('page-id').value = page.id || '';
            document.getElementById('page-layout').value = page.layout || 'page';
            document.getElementById('page-content').value = page.content || '';
            document.getElementById('page-status').value = page.status || 'draft';
            document.getElementById('page-created-at').value = page.created_at || new Date().toISOString();
            document.getElementById('page-updated-at').value = page.updated_at || new Date().toISOString();
        })
        .catch(error => {
            console.error('加载页面数据失败:', error);
            alert('加载页面数据失败');
        });
}

// 保存页面
function savePage() {
    const formData = new FormData(document.getElementById('page-editor-form'));
    const pageData = Object.fromEntries(formData.entries());
    
    // 验证必填字段
    if (!pageData.title || !pageData.id || !pageData.content) {
        alert('请填写所有必填字段');
        return;
    }
    
    // 设置时间戳
    const now = new Date().toISOString();
    pageData.updated_at = now;
    if (!pageData.created_at) {
        pageData.created_at = now;
    }
    
    // 发送保存请求
    fetch('/api/pages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
    })
    .then(response => {
        if (response.ok) {
            alert('页面保存成功');
        } else {
            throw new Error('保存失败');
        }
    })
    .catch(error => {
        console.error('保存页面失败:', error);
        alert('保存页面失败');
    });
}

// 预览页面
function previewPage() {
    const content = document.getElementById('page-content').value;
    const previewContent = document.getElementById('preview-content');
    
    // 简单的Markdown转HTML（实际项目中应使用专门的库）
    let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')              // 斜体
        .replace(/`(.*?)`/g, '<code>$1</code>')            // 行内代码
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')  // 链接
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')              // H1标题
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')             // H2标题
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')            // H3标题
        .replace(/^\* (.*$)/gm, '<li>$1</li>')             // 列表项
        .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')  // 包装列表
        .replace(/\n\n/g, '</p><p>')                       // 段落
        .replace(/^(?!<[hul])/gm, '<p>')                   // 开始段落标签
        .replace(/(?!<\/[hul]>)$/gm, '</p>');              // 结束段落标签
    
    previewContent.innerHTML = html;
    document.getElementById('preview-modal').style.display = 'block';
}

// 发布页面
function publishPage() {
    // 先保存页面
    savePage();
    
    // 获取页面ID
    const pageId = document.getElementById('page-id').value;
    
    // 发布页面
    fetch(`/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // 更新状态为已发布
            document.getElementById('page-status').value = 'published';
            alert('页面发布成功');
        } else {
            throw new Error('发布失败');
        }
    })
    .catch(error => {
        console.error('发布页面失败:', error);
        alert('发布页面失败');
    });
}