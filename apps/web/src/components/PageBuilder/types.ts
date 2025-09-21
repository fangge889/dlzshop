// 页面构建器类型定义

export interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: 'basic' | 'layout' | 'advanced';
  props: Record<string, any>;
  children?: ComponentConfig[];
}

export interface DragItem {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: string;
  isNew?: boolean;
}

export interface DropZone {
  id: string;
  accepts: string[];
  children: ComponentConfig[];
}

export interface PageBuilderState {
  components: ComponentConfig[];
  selectedComponent: string | null;
  draggedComponent: DragItem | null;
  previewMode: boolean;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}

export interface ComponentProps {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentConfig[];
  isSelected?: boolean;
  previewMode?: boolean;
  onSelect?: () => void;
  onUpdate?: (props: Record<string, any>) => void;
  onDelete?: () => void;
  parentId?: string;
  index?: number;
}

export interface ComponentLibraryItem {
  type: string;
  name: string;
  icon: string;
  category: 'basic' | 'layout' | 'advanced';
  defaultProps: Record<string, any>;
  preview: string;
}