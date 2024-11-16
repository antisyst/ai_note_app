import ReactDOM from 'react-dom';
import { FC, useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '../../components/Page';
import { useNote } from '../../hooks/useNote';
import { EditorContent, useEditor } from '@tiptap/react';
import { 
  ChevronLeft, Info, Undo2, Redo2, X, EllipsisVertical, Download, MessageSquareShare,Trash, SquareX } from 'lucide-react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import styles from './NotePage.module.scss';

const MAX_CHARACTERS = 3000;

interface HistoryEntry {
  type: 'title' | 'content';
  content: string;
}

export const NotePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { title, setTitle, content, setContent, saveNotes } = useNote(id || '1');

  const [characterCount, setCharacterCount] = useState(Array.from(content).length);
  const [wordCount, setWordCount] = useState(content.split(/\s+/).filter(Boolean).length);
  const [isEditing, setIsEditing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        const newKeyboardHeight = window.innerHeight - document.documentElement.clientHeight;
        setKeyboardHeight(newKeyboardHeight > 0 ? newKeyboardHeight : 0);
      } else {
        setKeyboardHeight(0);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const titleEditor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Title goes here...' })],
    content: title,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      ReactDOM.unstable_batchedUpdates(() => {
        setHistory((prev) => [...prev, { type: 'title', content: title }]);
        setTitle(text);
        saveNotes({ title: text, content });
        setRedoStack([]);
      });
    },
  });
  
  const contentEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type your content here...',
      }),
      Code,
      CodeBlock.configure({ HTMLAttributes: { class: 'code-block' } }),
    ],
    content: content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      const newCharacterCount = Array.from(htmlContent).length;
      const newWordCount = htmlContent.split(/\s+/).filter(Boolean).length;
  
      if (newCharacterCount <= MAX_CHARACTERS) {
        ReactDOM.unstable_batchedUpdates(() => {
          setHistory((prev) => [...prev, { type: 'content', content }]);
          setContent(htmlContent);
          setCharacterCount(newCharacterCount);
          setWordCount(newWordCount);
          saveNotes({ title, content: htmlContent });
          setRedoStack([]);
        });
      }
    },
  });
  
  useEffect(() => {
    titleEditor?.setEditable(isEditing);
    contentEditor?.setEditable(isEditing);
  }, [isEditing, titleEditor, contentEditor]);

  const handleEditMode = useCallback(
    (focusTarget: 'title' | 'content') => {
      setIsEditing(true);
      setTimeout(() => {
        if (focusTarget === 'title' && titleEditor) {
          titleEditor.commands.focus('end');
        } else if (focusTarget === 'content' && contentEditor) {
          contentEditor.commands.focus(); 
        }
      }, 0);
    },
    [titleEditor, contentEditor]
  );
  

  const handleSaveClick = useCallback(() => {
    setIsEditing(false);
    saveNotes({ title, content });
    titleEditor?.commands.blur();
    contentEditor?.commands.blur();
  }, [title, content, saveNotes, titleEditor, contentEditor]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const lastChange = history.pop();
    setRedoStack((prev) => [lastChange!, ...prev]);

    if (lastChange?.type === 'title') {
      setTitle(lastChange.content);
      titleEditor?.commands.setContent(lastChange.content);
    } else if (lastChange?.type === 'content') {
      setContent(lastChange.content);
      contentEditor?.commands.setContent(lastChange.content);
      setCharacterCount(Array.from(lastChange.content).length);
    }

    setHistory([...history]);
  }, [history, titleEditor, contentEditor]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextChange = redoStack.shift();
    setHistory((prev) => [...prev, nextChange!]);

    if (nextChange?.type === 'title') {
      setTitle(nextChange.content);
      titleEditor?.commands.setContent(nextChange.content);
    } else if (nextChange?.type === 'content') {
      setContent(nextChange.content);
      contentEditor?.commands.setContent(nextChange.content);
      setCharacterCount(Array.from(nextChange.content).length);
    }

    setRedoStack([...redoStack]);
  }, [redoStack, titleEditor, contentEditor]);

  const handleDelete = () => {
    const notes = JSON.parse(localStorage.getItem('notes') || '{}');
    delete notes[id!];
    localStorage.setItem('notes', JSON.stringify(notes));
    navigate('/index'); 
  };


  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    const formattedTitle = `**${title}**`;
    
    const plainContent = content.replace(/<[^>]*>/g, '');
  
    const message = `${formattedTitle}\n\n${plainContent}`;
  
    const telegramURL = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
    window.open(telegramURL, '_blank');
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  return (
    <Page back={false}>
      <header className={`${styles.noteHeader} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.noteHeaderRow}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ChevronLeft color="var(--wht)" size={30} strokeWidth={1.5} />
            <p>{t('Notes')}</p>
          </button>
        </div>
        <div className={styles.noteHeaderRow}>
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="normalMode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={styles.noteHeaderTools}
              >
                <button onClick={() => setShowInfoModal(true)} className={styles.infoButton}>
                  <Info color="var(--wht)" size={25} strokeWidth={1.8} />
                </button>
                <button onClick={() => handleEditMode('content')} className={styles.editButton}>
                   {t('Edit')}
                </button>
                <div onClick={handleDropdownToggle} className={styles.moreButton}>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDropdownOpen ? (
                        <X color="var(--wht)" size={22} strokeWidth={1.8} />
                      ) : (
                        <EllipsisVertical color="var(--wht)" size={22} strokeWidth={1.8} />
                      )}
                    </motion.div>
                  {isDropdownOpen && (
                    <AnimatePresence>
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, scale: 0.8, originY: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className={styles.dropdown}
                      >
                        <button onClick={handleShare}>
                          <MessageSquareShare color="var(--wht)" size={17} strokeWidth={2.1}/>
                          <p>{t('Share')}</p>
                        </button>
                        <button onClick={handleDownload}>
                          <Download color="var(--wht)" size={17} strokeWidth={2.1}/>
                          <p>{t('Download')}</p>
                        </button>
                        <button onClick={() => setIsDropdownOpen(false)} className={styles.closeDropdownButton}>
                          <SquareX color="var(--wht)" size={17} strokeWidth={2.1}/>
                           <p>{t('Close')}</p>
                        </button>
                        <button onClick={handleDelete} className={styles.deleteNoteButton}>
                          <Trash color="#ff0000" size={17} strokeWidth={2.1}/>
                          <p>{t('Delete')}</p>
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editMode"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={styles.editModeTools}
              >
                <button onClick={handleUndo} className={styles.undoButton} disabled={history.length === 0}>
                  <Undo2 />
                </button>
                <button onClick={handleRedo} className={styles.redoButton} disabled={redoStack.length === 0}>
                  <Redo2 />
                </button>
                <button onClick={handleSaveClick} className={styles.saveButton}>
                 <p>{t('Save')}</p>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      <div className={styles.scrollContainer}>
        <div onClick={() => handleEditMode('title')} className={styles.titleEditorContainer}>
          <EditorContent editor={titleEditor} className={styles.titleEditor} />
        </div>
        <div onClick={() => handleEditMode('content')} className={styles.editorContainer}>
          <EditorContent editor={contentEditor} className={`${styles.editorContent} ${isEditing ? '' : styles.readOnly}`} />
        </div>
      </div>
      {isEditing && (
          <AnimatePresence>
            <motion.div
              className={styles.toolbar}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{
                bottom: isMobile ? `${keyboardHeight}px` : 0,
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
          </AnimatePresence>
        )}
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3>{t('NoteStats')}</h3>
            <p>{t('CharacterCount')}: <span>{characterCount}</span></p>
            <p>{t('WordCount')}: <span>{wordCount}</span></p>
            <p>{t('MaxLimit')}: <span>{MAX_CHARACTERS}</span> characters</p>
            <button onClick={() => setShowInfoModal(false)} className={styles.closeModalButton}>
              <X color="var(--wht)" size={25} strokeWidth={1.8}/>
            </button>
          </motion.div>
        </div>
      )}
    </Page>
  );
};