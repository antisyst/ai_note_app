import { FC, useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import styles from './Toolbar.module.scss';
import { motion } from 'framer-motion';

interface ToolbarProps {
  contentEditor: Editor | null;
  isMobile: boolean;
  keyboardHeight: number;
  isEditing: boolean;
}

export const Toolbar: FC<ToolbarProps> = ({ contentEditor, isMobile, keyboardHeight, isEditing }) => {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    if (isMobile) {
      const handleResize = () => {
        const newOffset = isEditing ? keyboardHeight : 0;
        setBottomOffset(newOffset);
      };

      window.visualViewport?.addEventListener('resize', handleResize);
      window.visualViewport?.addEventListener('scroll', handleResize);

      handleResize();

      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('scroll', handleResize);
      };
    } else {
      setBottomOffset(0);
    }
  }, [isMobile, keyboardHeight, isEditing]);

  return (
    <motion.div
      className={styles.toolbar}
      initial={{ y: 20 }}
      animate={{ y: -bottomOffset }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
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