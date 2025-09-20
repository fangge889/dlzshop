// 管理界面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 页面管理功能
    loadPages();
    loadNavigation();
    loadSiteSettings();
    
    // 绑定事件
    document.getElementById('add-page').addEventListener('click', showAddPageModal);
    document.getElementById('refresh-pages').addEventListener('click', loadPages);
    document.getElementById('add-nav-item').addEventListener('click', showAddNavItemModal);
    document.getElementById('refresh-nav').addEventListener('click', loadNavigation);
    document.getElementById('site-settings-form').addEventListener('submit', saveSiteSettings);
    
    // 模态框事件
    const modal = document.getElementById('add-page-modal');
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
    
    // 添加页面表单提交事件
    document.getElementById('add-page-form').addEventListener('submit', addNewPage);
});

// 加载页面列表
function loadPages() {
    fetch('/api/pages')
        .then(response => response.json())
        .then(pages => {
            const tbody = document.querySelector('#pages-table tbody');
            tbody.innerHTML = '';
            
            pages.forEach(page => {
                const row = document.createElement('tr');
                // 格式化日期显示
                const updatedAt = page.updated_at ? new Date(page.updated_at).toLocaleString('zh-CN') : '未知';
                
                row.innerHTML = `
                    <td>${page.title}</td>
                    <td>${page.url || `/${page.id}/`}</td>
                    <td>${page.status === 'published' ? '已发布' : '草稿'}</td>
                    <td>${updatedAt}</td>
                    <td>
                        <button class="btn btn-primary" onclick="editPage('${page.id}')">编辑</button>
                        ${page.status === 'published' ? 
                            `<button class="btn btn-secondary" onclick="unpublishPage('${page.id}')">取消发布</button>` : 
                            `<button class="btn btn-success" onclick="publishPage('${page.id}')">发布</button>`}
                        <button class="btn btn-danger" onclick="deletePage('${page.id}')">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载页面失败:', error);
            alert('加载页面失败');
        });
}

// 加载导航菜单
function loadNavigation() {
    fetch('/api/navigation')
        .then(response => response.json())
        .then(navData => {
            const navList = document.getElementById('nav-list');
            navList.innerHTML = '';
            
            navData.menu.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.title} (${item.url})</span>
                    <button class="btn btn-primary" onclick="editNavItem('${item.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="deleteNavItem('${item.id}')">删除</button>
                `;
                navList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('加载导航失败:', error);
            alert('加载导航失败');
        });
}

// 加载站点设置
function loadSiteSettings() {
    fetch('/api/site-config')
        .then(response => response.json())
        .then(config => {
            document.getElementById('site-name').value = config.site_name || '';
            document.getElementById('site-description').value = config.site_description || '';
        })
        .catch(error => {
            console.error('加载站点设置失败:', error);
        });
}

// 显示添加页面模态框
function showAddPageModal() {
    document.getElementById('add-page-modal').style.display = 'block';
}

// 编辑页面
function editPage(pageId) {
    alert(`编辑页面: ${pageId}`);
}

// 删除页面
function deletePage(pageId) {
    if (confirm(`确定要删除页面 ${pageId} 吗？`)) {
        alert(`删除页面: ${pageId}`);
    }
}

// 显示添加导航项模态框
function showAddNavItemModal() {
    alert('添加导航项功能将在后续版本中实现');
}

// 编辑导航项
function editNavItem(navId) {
    alert(`编辑导航项: ${navId}`);
}

// 删除导航项
function deleteNavItem(navId) {
    if (confirm(`确定要删除导航项 ${navId} 吗？`)) {
        alert(`删除导航项: ${navId}`);
    }
}

// 发布页面
function publishPage(pageId) {
    fetch(`/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('页面发布成功');
            loadPages(); // 重新加载页面列表
        } else {
            throw new Error('发布失败');
        }
    })
    .catch(error => {
        console.error('发布页面失败:', error);
        alert('发布页面失败');
    });
}

// 取消发布页面
function unpublishPage(pageId) {
    fetch(`/api/pages/${pageId}/unpublish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('页面已转为草稿');
            loadPages(); // 重新加载页面列表
        } else {
            throw new Error('操作失败');
        }
    })
    .catch(error => {
        console.error('取消发布页面失败:', error);
        alert('取消发布页面失败');
    });
}

// 添加新页面
function addNewPage(event) {
    event.preventDefault();
    
    const formData = new FormData(document.getElementById('add-page-form'));
    const pageData = Object.fromEntries(formData.entries());
    
    // 设置默认值
    pageData.content = '# ' + pageData.title + '\n\n这是新页面的内容，请编辑此页面。';
    pageData.status = 'draft';
    pageData.created_at = new Date().toISOString();
    pageData.updated_at = pageData.created_at;
    
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
            alert('页面创建成功');
            document.getElementById('add-page-modal').style.display = 'none';
            loadPages(); // 重新加载页面列表
        } else {
            throw new Error('创建失败');
        }
    })
    .catch(error => {
        console.error('创建页面失败:', error);
        alert('创建页面失败');
    });
}

// 编辑页面
function editPage(pageId) {
    // 跳转到编辑器页面
    window.location.href = `/admin/editor?id=${pageId}`;
}

// 保存站点设置
function saveSiteSettings(event) {
    event.preventDefault();
    
    const siteName = document.getElementById('site-name').value;
    const siteDescription = document.getElementById('site-description').value;
    const adminEmail = document.getElementById('admin-email').value;
    
    const config = {
        site_name: siteName,
        site_description: siteDescription,
        admin_email: adminEmail
    };
    
    fetch('/api/site-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
    .then(response => {
        if (response.ok) {
            alert('站点设置保存成功');
        } else {
            throw new Error('保存失败');
        }
    })
    .catch(error => {
        console.error('保存站点设置失败:', error);
        alert('保存站点设置失败');
    });
}