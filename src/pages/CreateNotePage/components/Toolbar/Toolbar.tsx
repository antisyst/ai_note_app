import { FC, useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import styles from './Toolbar.module.scss';
import { motion } from 'framer-motion';

interface ToolbarProps {
  contentEditor: Editor | null;
  isMobile: boolean;
  isEditing: boolean;
}

export const Toolbar: FC<ToolbarProps> = ({ contentEditor, isMobile, isEditing }) => {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const handleViewportResize = () => {
      if (isMobile && window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        setBottomOffset(isEditing ? keyboardHeight : 0);
      } else {
        setBottomOffset(0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
      window.visualViewport.addEventListener('scroll', handleViewportResize);
    }

    handleViewportResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
        window.visualViewport.removeEventListener('scroll', handleViewportResize);
      }
    };
  }, [isMobile, isEditing]);

  return (
    <motion.div
      className={styles.toolbar}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isEditing ? 1 : 0, y: isEditing ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        bottom: `${bottomOffset}px`,
        left: '0',
        right: '0',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => contentEditor?.chain().focus().toggleBold().run()}
        className={contentEditor?.isActive('bold') ? styles.activeButton : ''}
      >
        Bold
      </button>
      <button
        onClick={() => contentEditor?.chain().focus().toggleItalic().run()}
        className={contentEditor?.isActive('italic') ? styles.activeButton : ''}
      >
        Italic
      </button>
      <button
        onClick={() => contentEditor?.chain().focus().toggleStrike().run()}
        className={contentEditor?.isActive('strike') ? styles.activeButton : ''}
      >
        Strike
      </button>
      <button
        onClick={() => contentEditor?.chain().focus().toggleCode().run()}
        className={contentEditor?.isActive('code') ? styles.activeButton : ''}
      >
        Code
      </button>
      <button
        onClick={() => contentEditor?.chain().focus().toggleCodeBlock().run()}
        className={contentEditor?.isActive('codeBlock') ? styles.activeButton : ''}
      >
        Code Block
      </button>
    </motion.div>
  );
};
