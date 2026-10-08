'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Icon from '../../atoms/Icon';
import styles from './index.module.scss';

export interface WysiwygEmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function WysiwygEmailEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Escribe el contenido central del correo de bienvenida...',
}: WysiwygEmailEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline font-medium hover:text-blue-300',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        protocols: ['http', 'https', 'mailto'],
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: styles['wysiwyg__content'],
      },
      // Prevent dropping files / images
      handleDrop: () => true,
      handlePaste: (_view, event) => {
        // Disallow pasting images/files
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              event.preventDefault();
              return true; // blocked
            }
          }
        }
        return false;
      },
    },
  });

  // Sync external value changes when not focused
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className={styles['wysiwyg__loading']}>
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
        <span className="text-xs text-slate-400">Iniciando editor seguro...</span>
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL del enlace (https://):', previousUrl);

    if (url === null) {
      return;
    }

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Simple protocol validation
    let validUrl = url.trim();
    if (!/^https?:\/\//i.test(validUrl) && !/^mailto:/i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
  };

  return (
    <div className={styles['wysiwyg']}>
      {/* Toolbar */}
      <div className={styles['wysiwyg__toolbar']}>
        <div className={styles['wysiwyg__toolbar-group']}>
          {/* Bold */}
          <button
            type="button"
            title="Negrita"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('bold') ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <Icon name="format_bold" className="text-sm" />
          </button>

          {/* Italic */}
          <button
            type="button"
            title="Cursiva"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('italic') ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <Icon name="format_italic" className="text-sm" />
          </button>
        </div>

        <div className={styles['wysiwyg__divider']} />

        <div className={styles['wysiwyg__toolbar-group']}>
          {/* H2 */}
          <button
            type="button"
            title="Encabezado 2"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('heading', { level: 2 }) ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <span className="text-xs font-bold leading-none">H2</span>
          </button>

          {/* H3 */}
          <button
            type="button"
            title="Encabezado 3"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('heading', { level: 3 }) ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <span className="text-xs font-bold leading-none">H3</span>
          </button>

          {/* Paragraph / Normal text */}
          <button
            type="button"
            title="Párrafo normal"
            disabled={disabled}
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('paragraph') && !editor.isActive('heading') ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <Icon name="format_paragraph" className="text-sm" />
          </button>
        </div>

        <div className={styles['wysiwyg__divider']} />

        <div className={styles['wysiwyg__toolbar-group']}>
          {/* Bullet List */}
          <button
            type="button"
            title="Lista con viñetas"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('bulletList') ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <Icon name="format_list_bulleted" className="text-sm" />
          </button>

          {/* Ordered List */}
          <button
            type="button"
            title="Lista numerada"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('orderedList') ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <Icon name="format_list_numbered" className="text-sm" />
          </button>
        </div>

        <div className={styles['wysiwyg__divider']} />

        <div className={styles['wysiwyg__toolbar-group']}>
          {/* Link */}
          <button
            type="button"
            title="Insertar enlace"
            disabled={disabled}
            onClick={setLink}
            className={`${styles['wysiwyg__toolbar-btn']} ${editor.isActive('link') ? styles['wysiwyg__toolbar-btn--active'] : ''}`}
          >
            <Icon name="link" className="text-sm" />
          </button>

          {/* Unlink */}
          {editor.isActive('link') && (
            <button
              type="button"
              title="Quitar enlace"
              disabled={disabled}
              onClick={() => editor.chain().focus().unsetLink().run()}
              className={styles['wysiwyg__toolbar-btn']}
            >
              <Icon name="link_off" className="text-sm" />
            </button>
          )}

          {/* Clear Formatting */}
          <button
            type="button"
            title="Limpiar formato"
            disabled={disabled}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className={styles['wysiwyg__toolbar-btn']}
          >
            <Icon name="format_clear" className="text-sm" />
          </button>
        </div>

        <div className={styles['wysiwyg__divider']} />

        <div className={styles['wysiwyg__toolbar-group']}>
          {/* Undo */}
          <button
            type="button"
            title="Deshacer"
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            className={styles['wysiwyg__toolbar-btn']}
          >
            <Icon name="undo" className="text-sm" />
          </button>

          {/* Redo */}
          <button
            type="button"
            title="Rehacer"
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            className={styles['wysiwyg__toolbar-btn']}
          >
            <Icon name="redo" className="text-sm" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
          <Icon name="shield" className="text-xs" />
          <span>Safe WYSIWYG (No JS / No Images)</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className={styles['wysiwyg__editor-area']}>
        <EditorContent editor={editor} />
      </div>

      {/* Help Variables Bar */}
      <div className={styles['wysiwyg__help-bar']}>
        <span className="text-[11px] text-slate-400 font-medium">Variables dinámicas disponibles:</span>
        <div className="flex flex-wrap gap-1.5">
          <code className={styles['wysiwyg__var-badge']} title="Nombre del cliente">
            &#123;&#123;client_name&#125;&#125;
          </code>
          <code className={styles['wysiwyg__var-badge']} title="Nombre del producto">
            &#123;&#123;product_name&#125;&#125;
          </code>
          <code className={styles['wysiwyg__var-badge']} title="Nombre del proveedor">
            &#123;&#123;provider_name&#125;&#125;
          </code>
        </div>
      </div>
    </div>
  );
}
