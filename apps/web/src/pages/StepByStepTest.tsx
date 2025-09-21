import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Steps,
  Divider,
  List,
  Tag,
  Collapse,
  Image,
  notification
} from 'antd';
import { 
  PlayCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RightOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export const StepByStepTest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  interface TestAction {
    action: string;
    expected: string;
    button?: string;
    url?: string;
  }

  interface TestStep {
    title: string;
    description: string;
    actions: TestAction[];
    tips?: string[];
  }

  const testSteps: TestStep[] = [
    {
      title: '第1步：打开测试页面',
      description: '首先打开内容工作流测试页面',
      actions: [
        {
          action: '点击下方按钮打开测试页面',
          expected: '在新标签页中看到"内容管理工作流测试页面"',
          button: '打开测试页面',
          url: '/test/workflow'
        }
      ],
      tips: [
        '建议同时保持测试指南页面打开，方便对照操作',
        '如果页面加载失败，请检查开发服务器是否正常运行'
      ]
    },
    {
      title: '第2步：功能概览测试',
      description: '测试基础状态显示和快速操作功能',
      actions: [
        {
          action: '查看"当前测试内容状态"卡片',
          expected: '看到标题、状态标签、作者、更新时间等信息'
        },
        {
          action: '点击"通过审核"按钮',
          expected: '状态从"待审核"变为"已审核"，出现成功提示'
        },
        {
          action: '点击"发布"按钮',
          expected: '状态变为"已发布"，操作历史增加新记录'
        },
        {
          action: '查看操作历史时间线',
          expected: '看到完整的操作记录，包括时间、用户、操作类型'
        }
      ],
      tips: [
        '每次点击操作按钮后，注意观察状态变化',
        '操作历史会实时更新，显示最新的操作记录'
      ]
    },
    {
      title: '第3步：内容编辑器测试',
      description: '测试富文本编辑和内容管理功能',
      actions: [
        {
          action: '点击"内容编辑器"标签页',
          expected: '切换到编辑器界面，看到表单和富文本编辑器'
        },
        {
          action: '修改标题字段',
          expected: '可以正常输入和编辑标题内容'
        },
        {
          action: '在富文本编辑器中编辑内容',
          expected: '可以输入文本，使用工具栏格式化功能'
        },
        {
          action: '测试工具栏功能（粗体、斜体、列表等）',
          expected: '选中文本后点击格式按钮，文本样式发生变化'
        },
        {
          action: '点击"插入链接"按钮',
          expected: '弹出链接插入对话框'
        },
        {
          action: '切换到"SEO优化"标签',
          expected: '看到SEO设置表单和预览效果'
        },
        {
          action: '填写SEO标题和描述',
          expected: '预览区域实时显示搜索引擎效果'
        },
        {
          action: '点击"保存草稿"按钮',
          expected: '显示保存成功提示'
        }
      ],
      tips: [
        '富文本编辑器支持多种格式化选项',
        'SEO预览会实时更新，帮助优化搜索引擎显示效果',
        '保存操作会触发状态更新'
      ]
    },
    {
      title: '第4步：内容列表测试',
      description: '测试内容管理列表功能',
      actions: [
        {
          action: '点击"内容列表"标签页',
          expected: '看到内容列表界面，包含筛选和搜索功能'
        },
        {
          action: '测试状态筛选下拉框',
          expected: '可以按不同状态筛选内容'
        },
        {
          action: '使用搜索框搜索内容',
          expected: '输入关键词后列表实时过滤'
        },
        {
          action: '点击表格排序按钮',
          expected: '列表按指定字段重新排序'
        },
        {
          action: '点击"编辑"按钮',
          expected: '显示编辑操作提示'
        },
        {
          action: '测试批量选择功能',
          expected: '可以选择多个内容项进行批量操作'
        }
      ],
      tips: [
        '列表支持多种筛选和排序方式',
        '批量操作可以提高管理效率',
        '所有操作都有相应的反馈提示'
      ]
    },
    {
      title: '第5步：审核管理测试',
      description: '测试内容审核工作流',
      actions: [
        {
          action: '点击"审核管理"标签页',
          expected: '看到审核管理界面，包含统计卡片和待审核列表'
        },
        {
          action: '查看统计概览卡片',
          expected: '显示待审核、紧急处理、今日提交的数量'
        },
        {
          action: '查看待审核内容列表',
          expected: '看到详细的内容信息和优先级标识'
        },
        {
          action: '点击"通过审核"按钮',
          expected: '显示审核成功提示，内容状态更新'
        },
        {
          action: '点击"详细审核"按钮',
          expected: '弹出详细审核对话框'
        },
        {
          action: '在审核对话框中查看内容预览',
          expected: '可以查看完整的内容信息'
        },
        {
          action: '测试"拒绝"操作',
          expected: '可以添加拒绝理由并执行拒绝操作'
        }
      ],
      tips: [
        '优先级通过颜色标识，红色表示紧急',
        '详细审核提供完整的内容预览',
        '所有审核操作都会记录在操作历史中'
      ]
    },
    {
      title: '第6步：发布管理测试',
      description: '测试内容发布和调度功能',
      actions: [
        {
          action: '点击"发布管理"标签页',
          expected: '看到发布管理界面，包含统计和内容表格'
        },
        {
          action: '查看发布统计卡片',
          expected: '显示待发布、定时发布、已发布、今日发布的统计'
        },
        {
          action: '在"待发布"表格中点击"立即发布"',
          expected: '内容立即发布，状态更新为已发布'
        },
        {
          action: '点击"定时发布"按钮',
          expected: '弹出定时发布设置对话框'
        },
        {
          action: '设置发布时间和备注',
          expected: '可以选择未来的发布时间'
        },
        {
          action: '查看"定时发布"标签页',
          expected: '看到已安排的定时发布任务'
        },
        {
          action: '查看发布日历',
          expected: '在日历中看到定时发布的安排'
        },
        {
          action: '在"已发布"标签中测试"取消发布"',
          expected: '可以取消已发布的内容'
        }
      ],
      tips: [
        '定时发布支持精确到分钟的时间设置',
        '发布日历提供直观的时间安排视图',
        '取消发布会将内容状态回退到草稿'
      ]
    }
  ];

  const markStepCompleted = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      notification.success({
        message: '步骤完成',
        description: `第${stepIndex + 1}步测试已完成！`,
        placement: 'topRight'
      });
    }
  };

  const openTestPage = (url: string) => {
    window.open(url, '_blank');
  };

  const currentStepData = testSteps[currentStep];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Card style={{ marginBottom: 24 }}>
          <Title level={2}>
            📋 按步骤测试 - 内容管理工作流
          </Title>
          <Paragraph>
            按照以下详细步骤逐一测试所有功能，确保每个功能都能正常工作。
          </Paragraph>
          
          <Alert
            message="测试前准备"
            description="确保开发服务器正在运行 (http://localhost:3004)，建议使用Chrome或Edge浏览器进行测试。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Steps
            current={currentStep}
            size="small"
            items={testSteps.map((step, index) => ({
              title: step.title,
              status: completedSteps.includes(index) ? 'finish' : 
                      index === currentStep ? 'process' : 'wait'
            }))}
          />
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0 }}>
              {currentStepData.title}
            </Title>
            <Tag color={completedSteps.includes(currentStep) ? 'success' : 'processing'}>
              {completedSteps.includes(currentStep) ? '已完成' : '进行中'}
            </Tag>
          </div>

          <Paragraph style={{ fontSize: 16, color: '#666' }}>
            {currentStepData.description}
          </Paragraph>

          <Divider />

          <Title level={4}>操作步骤：</Title>
          
          <List
            dataSource={currentStepData.actions}
            renderItem={(item, index) => (
              <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ 
                      minWidth: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: '#1890ff',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 'bold',
                      marginRight: 12
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        <RightOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        {item.action}
                      </div>
                      <div style={{ color: '#52c41a', fontSize: 14 }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        预期结果: {item.expected}
                      </div>
                      {item.button && (
                        <div style={{ marginTop: 8 }}>
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => openTestPage(item.url!)}
                          >
                            {item.button}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />

          {currentStepData.tips && (
            <>
              <Divider />
              <Alert
                message="💡 测试提示"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                }
                type="info"
                showIcon
              />
            </>
          )}

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
              icon={<CheckCircleOutlined />}
              onClick={() => markStepCompleted(currentStep)}
              disabled={completedSteps.includes(currentStep)}
            >
              {completedSteps.includes(currentStep) ? '已完成' : '标记完成'}
            </Button>
            
            <Button 
              type="primary"
              disabled={currentStep === testSteps.length - 1}
              onClick={() => setCurrentStep(currentStep + 1)}
              icon={<ArrowRightOutlined />}
            >
              下一步
            </Button>
          </Space>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Text type="secondary">
              步骤 {currentStep + 1} / {testSteps.length} 
              {completedSteps.length > 0 && (
                <span style={{ marginLeft: 16 }}>
                  已完成: {completedSteps.length}/{testSteps.length}
                </span>
              )}
            </Text>
          </div>
        </Card>

        <Card style={{ marginTop: 24 }}>
          <Collapse>
            <Panel header="🎯 完整测试清单" key="checklist">
              <div>
                <Title level={5}>功能模块测试状态：</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {testSteps.map((step, index) => (
                    <div key={index} style={{ 
                      padding: 12, 
                      background: completedSteps.includes(index) ? '#f6ffed' : '#fafafa',
                      border: `1px solid ${completedSteps.includes(index) ? '#b7eb8f' : '#d9d9d9'}`,
                      borderRadius: 6
                    }}>
                      <Space>
                        {completedSteps.includes(index) ? 
                          <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                        }
                        <Text strong>{step.title}</Text>
                        <Tag color={completedSteps.includes(index) ? 'success' : 'default'}>
                          {completedSteps.includes(index) ? '✓ 已完成' : '待测试'}
                        </Tag>
                      </Space>
                    </div>
                  ))}
                </Space>
              </div>
            </Panel>
          </Collapse>
        </Card>
      </div>
    </div>
  );
};