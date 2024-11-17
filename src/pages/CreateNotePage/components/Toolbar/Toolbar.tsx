import { FC, useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import styles from './Toolbar.module.scss';
import { motion } from 'framer-motion';

interface ToolbarProps {
  contentEditor: Editor | null;
  isMobile: boolean;
  keyboardHeight: number;
}

export const Toolbar: FC<ToolbarProps> = ({ contentEditor, isMobile }) => {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const handleViewportResize = () => {
      if (isMobile && window.visualViewport) {
        const keyboardHeight = window.visualViewport.height < window.innerHeight
          ? window.innerHeight - window.visualViewport.height
          : 0;
        setBottomOffset(keyboardHeight);
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
  }, [isMobile]);

  return (
    <motion.div
    className={styles.toolbar}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
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