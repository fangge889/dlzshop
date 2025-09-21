import React, { useState } from 'react';
import { 
  Card, 
  Steps, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Collapse,
  Tag,
  List,
  Divider
} from 'antd';
import { 
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export const TestGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTests, setCompletedTests] = useState<string[]>([]);

  const testSteps = [
    {
      title: '功能概览测试',
      description: '测试基础状态显示和快速操作',
      tests: [
        '查看当前内容状态显示',
        '点击工作流快速操作按钮',
        '观察操作历史时间线',
        '验证状态变更反馈'
      ]
    },
    {
      title: '内容编辑器测试',
      description: '测试富文本编辑和内容管理功能',
      tests: [
        '使用富文本编辑器编辑内容',
        '测试工具栏功能（粗体、斜体、列表等）',
        '插入链接和图片',
        '填写SEO优化信息',
        '添加和删除标签',
        '保存草稿功能',
        '提交审核功能'
      ]
    },
    {
      title: '内容列表测试',
      description: '测试内容管理列表功能',
      tests: [
        '查看内容列表展示',
        '测试筛选功能',
        '测试搜索功能',
        '测试排序功能',
        '测试批量操作',
        '测试编辑和删除操作'
      ]
    },
    {
      title: '审核管理测试',
      description: '测试内容审核工作流',
      tests: [
        '查看待审核内容统计',
        '查看待审核内容列表',
        '测试审核操作（通过/拒绝）',
        '测试详细审核弹窗',
        '验证审核后状态变更',
        '测试批量审核功能'
      ]
    },
    {
      title: '发布管理测试',
      description: '测试内容发布和调度功能',
      tests: [
        '查看发布统计概览',
        '测试立即发布功能',
        '测试定时发布设置',
        '查看发布日历',
        '测试取消发布功能',
        '验证发布状态变更'
      ]
    }
  ];

  const markTestCompleted = (testName: string) => {
    if (!completedTests.includes(testName)) {
      setCompletedTests([...completedTests, testName]);
    }
  };

  const isTestCompleted = (testName: string) => {
    return completedTests.includes(testName);
  };

  const getStepStatus = (stepIndex: number) => {
    const step = testSteps[stepIndex];
    const completedCount = step.tests.filter(test => isTestCompleted(test)).length;
    
    if (completedCount === step.tests.length) return 'finish';
    if (completedCount > 0) return 'process';
    return 'wait';
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card style={{ marginBottom: 24 }}>
          <Title level={2}>
            🧪 内容管理工作流 - 完整测试指南
          </Title>
          <Paragraph>
            按照以下步骤系统性地测试所有功能模块，确保每个功能都能正常工作。
          </Paragraph>
          
          <Alert
            message="测试提示"
            description="建议在新标签页中打开测试页面，这样可以同时查看测试指南和实际操作。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
            action={
              <Button 
                size="small" 
                type="primary"
                onClick={() => window.open('/test/workflow', '_blank')}
              >
                打开测试页面
              </Button>
            }
          />
        </Card>

        <Card>
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            direction="vertical"
            items={testSteps.map((step, index) => ({
              title: step.title,
              description: step.description,
              status: getStepStatus(index),
              icon: getStepStatus(index) === 'finish' ? <CheckCircleOutlined /> : undefined
            }))}
          />
        </Card>

        <Card style={{ marginTop: 24 }}>
          <Title level={3}>
            {testSteps[currentStep].title}
          </Title>
          <Paragraph>
            {testSteps[currentStep].description}
          </Paragraph>

          <List
            dataSource={testSteps[currentStep].tests}
            renderItem={(test, index) => (
              <List.Item
                actions={[
                  <Button
                    key="complete"
                    type={isTestCompleted(test) ? "default" : "primary"}
                    size="small"
                    icon={isTestCompleted(test) ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => markTestCompleted(test)}
                  >
                    {isTestCompleted(test) ? '已完成' : '标记完成'}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: isTestCompleted(test) ? '#52c41a' : '#d9d9d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                  }
                  title={
                    <span style={{ 
                      textDecoration: isTestCompleted(test) ? 'line-through' : 'none',
                      color: isTestCompleted(test) ? '#999' : 'inherit'
                    }}>
                      {test}
                    </span>
                  }
                />
              </List.Item>
            )}
          />

          <Divider />

          <Space>
            <Button 
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              上一步
            </Button>
            <Button 
              type="primary"
              disabled={currentStep === testSteps.length - 1}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              下一步
            </Button>
            <Text type="secondary">
              步骤 {currentStep + 1} / {testSteps.length}
            </Text>
          </Space>
        </Card>

        <Card style={{ marginTop: 24 }}>
          <Title level={4}>测试进度统计</Title>
          <Space wrap>
            {testSteps.map((step, index) => {
              const completedCount = step.tests.filter(test => isTestCompleted(test)).length;
              const totalCount = step.tests.length;
              const isComplete = completedCount === totalCount;
              
              return (
                <Tag 
                  key={index}
                  color={isComplete ? 'success' : completedCount > 0 ? 'processing' : 'default'}
                  style={{ padding: '4px 8px', margin: '4px' }}
                >
                  {step.title}: {completedCount}/{totalCount}
                </Tag>
              );
            })}
          </Space>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>
              总体进度: {completedTests.length}/{testSteps.reduce((sum, step) => sum + step.tests.length, 0)} 
              ({Math.round(completedTests.length / testSteps.reduce((sum, step) => sum + step.tests.length, 0) * 100)}%)
            </Text>
          </div>
        </Card>

        <Collapse style={{ marginTop: 24 }}>
          <Panel header="🔧 详细测试说明" key="details">
            <div>
              <Title level={5}>功能概览测试详情</Title>
              <ul>
                <li><strong>状态显示</strong>: 验证内容标题、状态标签、作者信息、更新时间是否正确显示</li>
                <li><strong>快速操作</strong>: 点击"通过审核"、"拒绝"、"发布"等按钮，观察状态变化</li>
                <li><strong>操作历史</strong>: 查看时间线是否显示完整的操作记录</li>
              </ul>

              <Title level={5}>内容编辑器测试详情</Title>
              <ul>
                <li><strong>富文本编辑</strong>: 测试粗体、斜体、列表、对齐等格式化功能</li>
                <li><strong>媒体插入</strong>: 测试插入链接、图片功能</li>
                <li><strong>SEO设置</strong>: 填写SEO标题、描述、关键词，查看预览效果</li>
                <li><strong>标签管理</strong>: 添加、删除标签功能</li>
                <li><strong>保存功能</strong>: 测试保存草稿和提交审核</li>
              </ul>

              <Title level={5}>审核管理测试详情</Title>
              <ul>
                <li><strong>统计信息</strong>: 查看待审核、紧急处理、今日提交的数量统计</li>
                <li><strong>审核操作</strong>: 测试通过审核、拒绝、详细审核等功能</li>
                <li><strong>优先级</strong>: 观察不同时间提交内容的优先级标识</li>
              </ul>

              <Title level={5}>发布管理测试详情</Title>
              <ul>
                <li><strong>发布统计</strong>: 查看待发布、定时发布、已发布、今日发布的统计</li>
                <li><strong>立即发布</strong>: 测试立即发布功能</li>
                <li><strong>定时发布</strong>: 设置定时发布时间和备注</li>
                <li><strong>发布日历</strong>: 查看日历视图中的定时发布安排</li>
                <li><strong>取消发布</strong>: 测试取消已发布内容的功能</li>
              </ul>
            </div>
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};