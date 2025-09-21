import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ComponentConfig, DragItem, PageBuilderState } from './types';

// Action 类型
type PageBuilderAction =
  | { type: 'SET_COMPONENTS'; payload: ComponentConfig[] }
  | { type: 'ADD_COMPONENT'; payload: { component: ComponentConfig; parentId?: string; index?: number } }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; props: Record<string, any> } }
  | { type: 'DELETE_COMPONENT'; payload: string }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'SET_DRAGGED_COMPONENT'; payload: DragItem | null }
  | { type: 'MOVE_COMPONENT'; payload: { dragId: string; hoverId: string; dragIndex: number; hoverIndex: number } }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_DEVICE_MODE'; payload: 'desktop' | 'tablet' | 'mobile' };

// 初始状态
const initialState: PageBuilderState = {
  components: [],
  selectedComponent: null,
  draggedComponent: null,
  previewMode: false,
  deviceMode: 'desktop'
};

// Reducer
function pageBuilderReducer(state: PageBuilderState, action: PageBuilderAction): PageBuilderState {
  switch (action.type) {
    case 'SET_COMPONENTS':
      return { ...state, components: action.payload };

    case 'ADD_COMPONENT': {
      const { component, parentId, index } = action.payload;
      
      if (!parentId) {
        // 添加到根级别
        const newComponents = [...state.components];
        if (typeof index === 'number') {
          newComponents.splice(index, 0, component);
        } else {
          newComponents.push(component);
        }
        return { ...state, components: newComponents };
      }

      // 添加到指定父组件
      const addToParent = (components: ComponentConfig[]): ComponentConfig[] => {
        return components.map(comp => {
          if (comp.id === parentId) {
            const children = comp.children || [];
            if (typeof index === 'number') {
              children.splice(index, 0, component);
            } else {
              children.push(component);
            }
            return { ...comp, children };
          }
          if (comp.children) {
            return { ...comp, children: addToParent(comp.children) };
          }
          return comp;
        });
      };

      return { ...state, components: addToParent(state.components) };
    }

    case 'UPDATE_COMPONENT': {
      const { id, props } = action.payload;
      
      const updateComponent = (components: ComponentConfig[]): ComponentConfig[] => {
        return components.map(comp => {
          if (comp.id === id) {
            return { ...comp, props: { ...comp.props, ...props } };
          }
          if (comp.children) {
            return { ...comp, children: updateComponent(comp.children) };
          }
          return comp;
        });
      };

      return { ...state, components: updateComponent(state.components) };
    }

    case 'DELETE_COMPONENT': {
      const deleteComponent = (components: ComponentConfig[]): ComponentConfig[] => {
        return components
          .filter(comp => comp.id !== action.payload)
          .map(comp => ({
            ...comp,
            children: comp.children ? deleteComponent(comp.children) : undefined
          }));
      };

      return {
        ...state,
        components: deleteComponent(state.components),
        selectedComponent: state.selectedComponent === action.payload ? null : state.selectedComponent
      };
    }

    case 'SELECT_COMPONENT':
      return { ...state, selectedComponent: action.payload };

    case 'SET_DRAGGED_COMPONENT':
      return { ...state, draggedComponent: action.payload };

    case 'MOVE_COMPONENT': {
      const { dragId, hoverId, dragIndex, hoverIndex } = action.payload;
      
      // 简化的移动逻辑，这里可以根据需要扩展
      const moveInArray = (arr: ComponentConfig[], fromIndex: number, toIndex: number) => {
        const result = [...arr];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        return result;
      };

      return {
        ...state,
        components: moveInArray(state.components, dragIndex, hoverIndex)
      };
    }

    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.payload };

    case 'SET_DEVICE_MODE':
      return { ...state, deviceMode: action.payload };

    default:
      return state;
  }
}

// Context
interface PageBuilderContextType {
  state: PageBuilderState;
  dispatch: React.Dispatch<PageBuilderAction>;
  // 便捷方法
  addComponent: (component: ComponentConfig, parentId?: string, index?: number) => void;
  updateComponent: (id: string, props: Record<string, any>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  setDraggedComponent: (component: DragItem | null) => void;
  moveComponent: (dragId: string, hoverId: string, dragIndex: number, hoverIndex: number) => void;
  setPreviewMode: (preview: boolean) => void;
  setDeviceMode: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const PageBuilderContext = createContext<PageBuilderContextType | null>(null);

// Provider
interface PageBuilderProviderProps {
  children: ReactNode;
  initialComponents?: ComponentConfig[];
}

export const PageBuilderProvider: React.FC<PageBuilderProviderProps> = ({ 
  children, 
  initialComponents = [] 
}) => {
  const [state, dispatch] = useReducer(pageBuilderReducer, {
    ...initialState,
    components: initialComponents
  });

  const contextValue: PageBuilderContextType = {
    state,
    dispatch,
    addComponent: (component, parentId, index) => 
      dispatch({ type: 'ADD_COMPONENT', payload: { component, parentId, index } }),
    updateComponent: (id, props) => 
      dispatch({ type: 'UPDATE_COMPONENT', payload: { id, props } }),
    deleteComponent: (id) => 
      dispatch({ type: 'DELETE_COMPONENT', payload: id }),
    selectComponent: (id) => 
      dispatch({ type: 'SELECT_COMPONENT', payload: id }),
    setDraggedComponent: (component) => 
      dispatch({ type: 'SET_DRAGGED_COMPONENT', payload: component }),
    moveComponent: (dragId, hoverId, dragIndex, hoverIndex) => 
      dispatch({ type: 'MOVE_COMPONENT', payload: { dragId, hoverId, dragIndex, hoverIndex } }),
    setPreviewMode: (preview) => 
      dispatch({ type: 'SET_PREVIEW_MODE', payload: preview }),
    setDeviceMode: (device) => 
      dispatch({ type: 'SET_DEVICE_MODE', payload: device })
  };

  return (
    <PageBuilderContext.Provider value={contextValue}>
      {children}
    </PageBuilderContext.Provider>
  );
};

// Hook
export const usePageBuilder = () => {
  const context = useContext(PageBuilderContext);
  if (!context) {
    throw new Error('usePageBuilder must be used within a PageBuilderProvider');
  }
  return context;
};