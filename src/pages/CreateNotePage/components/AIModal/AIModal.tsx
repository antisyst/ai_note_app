import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';
import Modal from '@/components/Modal/Modal';
import styles from './AIModal.module.scss';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  aiInput: string;
  setAiInput: (value: string) => void;
  aiGenerating: boolean;
}

export const AIModal: FC<AIModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  aiInput,
  setAiInput,
  aiGenerating,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (aiGenerating) {
      setElapsedTime(0);
      const startTime = Date.now();

      interval = setInterval(() => {
        const now = Date.now();
        setElapsedTime(now - startTime); 
      }, 10);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [aiGenerating]);

  const formattedTime = (elapsedTime / 1000).toFixed(2);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalHeader}>
        <h2 className={styles.generateContent}>Generate AI Content</h2>
      </div>
      <textarea
        value={aiInput}
        onChange={(e) => setAiInput(e.target.value)}
        placeholder="Type your topic or question..."
        className={styles.aiInput}
      />
      <div className={styles.modalActions}>
        <div className={styles.modalActionsRow}>
          <AnimatePresence>
            {aiGenerating && (
              <motion.div
                key="animated-counter"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={styles.counterContainer}
              >
                <p className={styles.counter}>
                  <Timer size={20}/> 
                  <span>{formattedTime}s</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={styles.modalActionsRow}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={aiGenerating}
            className={styles.generateButton}
          >
            {aiGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </Modal>
  );
};