import ReactDOM from 'react-dom';
import { FC, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../../components/Page';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import styles from './CreateNotePage.module.scss';
import Code from '@tiptap/extension-code';
import { NoteHeader } from './components/NoteHeader/NoteHeader';
import { Toolbar } from './components/Toolbar/Toolbar';
import { AIModal } from './components/AIModal/AIModal';
import { isMobile } from 'react-device-detect';
import axios from 'axios';


interface HistoryEntry {
  type: 'title' | 'content';
  content: string;
}

interface SpeechRecognitionError extends Event {
  error: string;
}

export const CreateNotePage: FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [canSave, setCanSave] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isCanceled, setIsCanceled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const titleEditorRef = useRef<Editor | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const speechLanguage = (localStorage.getItem('speechLanguage') || 'en-US').split('-')[0].toUpperCase();

  const titleEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Title',
        emptyNodeClass:
          'first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:h-0',
      }),
    ],
    content: title,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      titleEditorRef.current = editor;
      editor.commands.focus('start');
      const text = editor.getText();
      ReactDOM.unstable_batchedUpdates(() => {
        setHistory((prev) => [...prev, { type: 'title', content: title }]);
        setTitle(text);
        setRedoStack([]);
      });
    },
    onCreate: ({ editor }) => {
      titleEditorRef.current = editor;
      setIsReady(true);
    },
  });

  useEffect(() => {
    if (isReady && titleEditor) {
      const timeout = setTimeout(() => {
        titleEditor.commands.focus('end');
      }, 300); // Slight delay to ensure focus works on mobile
      return () => clearTimeout(timeout);
    }
  }, [isReady, titleEditor]);
  const contentEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
      placeholder: 'Type your content here...',
      emptyNodeClass:
       'first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:h-0',
     }),
      Code,
      CodeBlock.configure({ HTMLAttributes: { class: 'code-block' } }),
    ],
    content: content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      ReactDOM.unstable_batchedUpdates(() => {
        setHistory((prev) => [...prev, { type: 'content', content }]);
        setContent(htmlContent);
        setRedoStack([]);
      });
    },
  });

  useEffect(() => {
    setCanSave(title.trim().length > 0 && content.trim().length > 0);
  }, [title, content]);

  useEffect(() => {
    if (titleEditor) {
      titleEditor.commands.focus('start');
    }

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
  }, [titleEditor]);

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (titleEditor) {
        titleEditor.commands.focus('start');
      }
    }, 100);
  
    return () => clearTimeout(focusTimeout);
  }, [titleEditor]);
  

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
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  

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
    }

    setRedoStack([...redoStack]);
  }, [redoStack, titleEditor, contentEditor]);

  const handleSaveClick = () => {
    const newId = Date.now().toString();
    const notes = JSON.parse(localStorage.getItem('notes') || '{}');
    notes[newId] = { title, content };
    localStorage.setItem('notes', JSON.stringify(notes));
    navigate('/index');
  };

  const handleCancelClick = () => {
    navigate('/index');
  };

  const handleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.lang = speechLanguage;
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcriptArray = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' ');

        const isFinal = event.results[event.results.length - 1].isFinal;
        const processedText = transcriptArray
          .replace(/\bnew line\b/gi, '\n')
          .replace(/\bcomma\b/gi, ',')
          .replace(/\bperiod\b/gi, '.')
          .replace(/\bdelete\b/gi, () => {
            setContent((prevContent) => prevContent.slice(0, -1));
            return '';
          });

          const newContent = `${processedText} `;

          requestAnimationFrame(() => {
            contentEditor?.commands.setContent(
              `<motion.div
                key={Date.now()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                ${newContent}
              </motion.div>`,
              isFinal
            );
          });
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionError) => {
        console.error(`Error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isListening) recognitionRef.current?.start();
      };
    }

    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  useEffect(() => {
    if (!isListening || audioContext) return;
  
    const context = new AudioContext();
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 256;
  
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = context.createMediaStreamSource(stream);
      source.connect(analyserNode);
      setAudioContext(context);
      setAnalyser(analyserNode);
    });
  
    return () => {
      context?.close();
      setAudioContext(null);
      setAnalyser(null);
    };
  }, [isListening]);

  useEffect(() => {
    if (generatedContent && generatedContent.length <= 100000) {
      contentEditor?.commands.setContent(generatedContent);
    }
  }, [generatedContent]);

  
  

  const openModal = () => {
    setAiInput('');
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setAiInput('');
    setIsModalOpen(false);
  };  
  
  const generateAIContent = async () => {
    if (!aiInput.trim()) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    const signal = controller.signal;

    setAiGenerating(true);
    setIsCanceled(false);

    try {
      const response = await axios.post(
        'https://api.cohere.ai/generate',
        {
          model: 'command-xlarge-nightly',
          prompt: aiInput,
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer fXzcYyUOXqbUqzarYPhzFp2C21qGhj1V3orIzslW`,
            'Content-Type': 'application/json',
          },
          signal,
        }
      );

      if (isCanceled) {
        console.log('Generation canceled by user.');
        return;
      }

      let generatedText = response.data.text.trim();
      generatedText = generatedText.replace(/\n\n/g, '<p></p>');

      if (generatedText.length > 30000) {
        generatedText = `${generatedText.slice(0, 30000)}...`;
      }

      const updatedContent = `${content}\n\n${generatedText}`;
      setContent(updatedContent);
      contentEditor?.commands.setContent(updatedContent);

      setAiInput('');
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error generating AI content:', error);
      }
    } finally {
      setAiGenerating(false);
      closeModal();
    }
  };

  const handleCancelGenerate = () => {
    setIsCanceled(true);
    controllerRef.current?.abort();
    controllerRef.current = null;
    setAiGenerating(false);
    closeModal();
  };


  useEffect(() => {
    if (generatedContent) {
      const safeContent = `${content}\n\n${generatedContent}`;
      if (safeContent.length > 30000) {
        console.warn('Content length exceeds maximum allowed size.');
        console.log(setGeneratedContent);
      } else {
        setContent(safeContent);
        contentEditor?.commands.setContent(safeContent); 
      }
    }
  }, [generatedContent, contentEditor]);  
  
  useEffect(() => {
    const handleResize = () => {
      if (isMobile && window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        if (isEditing && !isModalOpen) {
          setKeyboardHeight(keyboardHeight > 0 ? keyboardHeight : 0);
        } else {
          setKeyboardHeight(0);
        }
      }
    };
  
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
  
    handleResize();
  
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isEditing, isModalOpen, isMobile]);  
  
  return (
    <Page back={true}>
      <NoteHeader
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleSpeechRecognition={handleSpeechRecognition}
        handleStopListening={handleStopListening}
        handleCancelClick={handleCancelClick}
        handleSaveClick={handleSaveClick}
        openModal={openModal}
        isListening={isListening}
        historyLength={history.length}
        redoStackLength={redoStack.length}
        canSave={canSave}
        speechLanguage={speechLanguage}
        audioContext={audioContext}
        analyser={analyser}
      />
      <div className={styles.scrollContainer}>
        <div onClick={() => setIsEditing(true)} className={styles.titleEditorContainer}>
          <EditorContent editor={titleEditor} className={styles.titleEditor} />
        </div>
        <div onClick={() => setIsEditing(true)} className={styles.editorContainer}>
          <EditorContent editor={contentEditor} className={styles.editorContent} />
        </div>
      </div>
      {isEditing && (
        <Toolbar
          contentEditor={contentEditor}
          isMobile={isMobile}
          keyboardHeight={keyboardHeight}
         />
      )}
      <AIModal
        isOpen={isModalOpen}
        onClose={handleCancelGenerate}
        onGenerate={generateAIContent}
        aiInput={aiInput}
        setAiInput={setAiInput}
        aiGenerating={aiGenerating}
      />
    </Page>
  );
};