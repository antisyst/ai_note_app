import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Redo2, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SoundVisualizer from '@/components/SoundVisualizer';
import styles from './NoteHeader.module.scss';

interface NoteHeaderProps {
  handleUndo: () => void;
  handleRedo: () => void;
  handleSpeechRecognition: () => void;
  handleStopListening: () => void;
  handleCancelClick: () => void;
  handleSaveClick: () => void;
  openModal: () => void;
  isListening: boolean;
  historyLength: number;
  redoStackLength: number;
  canSave: boolean;
  speechLanguage: string;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
}

export const NoteHeader: FC<NoteHeaderProps> = ({
  handleUndo,
  handleRedo,
  handleSpeechRecognition,
  handleStopListening,
  handleCancelClick,
  handleSaveClick,
  openModal,
  isListening,
  historyLength,
  redoStackLength,
  canSave,
  audioContext,
  analyser,
}) => {
  const { t } = useTranslation();

  return (
    <header className={styles.noteHeader}>
      <AnimatePresence mode="wait">
        <motion.div
          key="toolbar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={styles.noteHeaderTools}
        >
          <div className={styles.noteHeaderToolRow}>
            <button onClick={handleUndo} className={styles.undoButton} disabled={historyLength === 0}>
              <Undo2 />
            </button>
            <button onClick={handleRedo} className={styles.redoButton} disabled={redoStackLength === 0}>
              <Redo2 />
            </button>
            <button onClick={openModal} className={styles.aiButton}>
              AI
            </button>
            <button
              onClick={isListening ? handleStopListening : handleSpeechRecognition}
              className={`${styles.microphoneButton} ${isListening ? styles.active : ''}`}
              aria-label={t('Start voice input')}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="visualizer"
                    className={styles.visualizerContainer}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    <SoundVisualizer audioContext={audioContext} analyser={analyser} isActive={isListening} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="micIcon"
                    className={styles.micIcon}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    <Mic />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          <div className={styles.noteHeaderToolRow}>
            <button onClick={handleCancelClick} className={styles.cancelButton}>
              {t('Cancel')}
            </button>
            <button onClick={handleSaveClick} className={styles.saveButton} disabled={!canSave}>
              {t('Save')}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </header>
  );
};