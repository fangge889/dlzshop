import React, { useState } from 'react';
import { 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message,
  Popconfirm 
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  SendOutlined, 
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { ContentItem, WorkflowAction, DEFAULT_WORKFLOW } from '../../types/content';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface WorkflowActionsProps {
  content: ContentItem;
  onAction: (action: WorkflowAction, data?: any) => Promise<void>;
  loading?: boolean;
}

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  content,
  onAction,
  loading = false
}) => {
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<WorkflowAction | null>(null);
  const [form] = Form.useForm();

  // 获取当前步骤的可用操作
  const getCurrentStepActions = () => {
    const currentStep = DEFAULT_WORKFLOW.steps.find(
      step => step.status === content.status
    );
    return currentStep?.actions || [];
  };

  const handleAction = async (action: WorkflowAction) => {
    if (action.type === 'approve' || action.type === 'reject') {
      setCurrentAction(action);
      setActionModalVisible(true);
    } else {
      try {
        await onAction(action);
        message.success(`操作成功：${action.name}`);
      } catch (error) {
        message.error(`操作失败：${error}`);
      }
    }
  };

  const handleModalOk = async () => {
    if (!currentAction) return;

    try {
      const values = await form.validateFields();
      await onAction(currentAction, values);
      message.success(`操作成功：${currentAction.name}`);
      setActionModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(`操作失败：${error}`);
    }
  };

  const handleModalCancel = () => {
    setActionModalVisible(false);
    setCurrentAction(null);
    form.resetFields();
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'approve':
        return <CheckOutlined />;
      case 'reject':
        return <CloseOutlined />;
      case 'publish':
        return <SendOutlined />;
      case 'edit':
        return <EditOutlined />;
      case 'archive':
        return <DeleteOutlined />;
      default:
        return <EditOutlined />;
    }
  };

  const getActionButtonType = (actionType: string) => {
    switch (actionType) {
      case 'approve':
      case 'publish':
        return 'primary';
      case 'reject':
      case 'archive':
        return 'default';
      default:
        return 'default';
    }
  };

  const actions = getCurrentStepActions();

  return (
    <>
      <Space wrap>
        {actions.map(action => (
          <Button
            key={action.id}
            type={getActionButtonType(action.type)}
            icon={getActionIcon(action.type)}
            loading={loading}
            onClick={() => handleAction(action)}
            danger={action.type === 'reject' || action.type === 'archive'}
          >
            {action.name}
          </Button>
        ))}

        {/* 预览按钮 */}
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            // 打开预览窗口
            window.open(`/preview/${content.id}`, '_blank');
          }}
        >
          预览
        </Button>

        {/* 定时发布按钮 */}
        {content.status === 'approved' && (
          <Button
            icon={<ScheduleOutlined />}
            onClick={() => {
              setCurrentAction({
                id: 'schedule',
                name: '定时发布',
                type: 'publish',
                targetStatus: 'published',
                requiredPermission: 'content.publish'
              });
              setActionModalVisible(true);
            }}
          >
            定时发布
          </Button>
        )}
      </Space>

      {/* 操作确认弹窗 */}
      <Modal
        title={currentAction?.name}
        open={actionModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            assignee: content.assignee?.id
          }}
        >
          {currentAction?.type === 'reject' && (
            <Form.Item
              name="comment"
              label="拒绝原因"
              rules={[{ required: true, message: '请输入拒绝原因' }]}
            >
              <TextArea
                rows={4}
                placeholder="请详细说明拒绝的原因，以便作者修改"
              />
            </Form.Item>
          )}

          {currentAction?.type === 'approve' && (
            <Form.Item
              name="comment"
              label="审核意见"
            >
              <TextArea
                rows={3}
                placeholder="可选：添加审核意见或建议"
              />
            </Form.Item>
          )}

          {currentAction?.id === 'schedule' && (
            <>
              <Form.Item
                name="scheduledAt"
                label="发布时间"
                rules={[{ required: true, message: '请选择发布时间' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  placeholder="选择发布时间"
                />
              </Form.Item>
              
              <Form.Item
                name="comment"
                label="备注"
              >
                <TextArea
                  rows={2}
                  placeholder="可选：添加定时发布的备注信息"
                />
              </Form.Item>
            </>
          )}

          {(currentAction?.type === 'approve' || currentAction?.type === 'reject') && (
            <Form.Item
              name="assignee"
              label="指派给"
            >
              <Select placeholder="选择下一步处理人">
                <Option value="user1">张三 (编辑)</Option>
                <Option value="user2">李四 (主编)</Option>
                <Option value="user3">王五 (管理员)</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};