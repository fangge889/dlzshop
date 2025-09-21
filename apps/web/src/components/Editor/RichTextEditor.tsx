import React, { useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import { Upload, message } from 'antd';
import { useUploadImagesMutation } from '../../services/mediaAPI';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '开始编写内容...',
  height = 400,
  readOnly = false,
  theme = 'snow'
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [uploadImages] = useUploadImagesMutation();

  // 图片上传处理
  const imageHandler = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // 检查文件大小
      if (file.size > 5 * 1024 * 1024) {
        message.error('图片大小不能超过 5MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('images', file);

        const result = await uploadImages(formData).unwrap();
        const imageUrl = result.files[0]?.filePath;

        if (imageUrl && quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          const index = range ? range.index : quill.getLength();
          
          quill.insertEmbed(index, 'image', imageUrl);
          quill.setSelection(index + 1, 0);
        }

        message.success('图片上传成功');
      } catch (error) {
        message.error('图片上传失败');
      }
    };
  }, [uploadImages]);

  // 自定义工具栏配置
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
        ['table']
      ],
      handlers: {
        image: imageHandler,
        table: function() {
          const quill = this.quill;
          const range = quill.getSelection();
          if (range) {
            // 插入简单的表格HTML
            const tableHtml = `
              <table style="border-collapse: collapse; width: 100%;">
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">单元格1</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">单元格2</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">单元格3</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">单元格4</td>
                </tr>
              </table>
              <p><br></p>
            `;
            quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
          }
        }
      }
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  }), [imageHandler]);

  // 格式配置
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video',
    'table'
  ];

  const handleChange = useCallback((content: string) => {
    onChange?.(content);
  }, [onChange]);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme={theme}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{ height: height }}
      />
    </div>
  );
};

export default RichTextEditor;