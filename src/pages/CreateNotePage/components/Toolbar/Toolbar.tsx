import { FC, useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import styles from './Toolbar.module.scss';
import { motion } from 'framer-motion';

interface ToolbarProps {
  contentEditor: Editor | null;
  isMobile: boolean;
  keyboardHeight: number;
}

export const Toolbar: FC<ToolbarProps> = ({ contentEditor, isMobile, keyboardHeight }) => {
  const [bottomPosition, setBottomPosition] = useState('20px');

  useEffect(() => {
    if (isMobile) {
      setBottomPosition(`${keyboardHeight > 0 ? keyboardHeight + 20 : 20}px`);
    } else {
      setBottomPosition('20px');
    }
  }, [isMobile, keyboardHeight]);

  return (
    <motion.div
      className={styles.toolbar}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{
        bottom: bottomPosition,
        position: 'fixed', // Ensure toolbar stays fixed on screen
        left: '0',
        right: '0',
        zIndex: 1000, // Make sure it stays above other content
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
