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
  onSelect?: (id: string) => void;
  onUpdate?: (id: string, props: Record<string, any>) => void;
  onDelete?: (id: string) => void;
}

export interface ComponentLibraryItem {
  type: string;
  name: string;
  icon: string;
  category: 'basic' | 'layout' | 'advanced';
  defaultProps: Record<string, any>;
  preview: string;
}