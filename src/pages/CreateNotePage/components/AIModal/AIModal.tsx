import { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>{t('Generate AI Content')}</h2>
      <textarea
        value={aiInput}
        onChange={(e) => setAiInput(e.target.value)}
        placeholder={t('Type your topic or question...')}
        className={styles.aiInput}
      />
      <div className={styles.modalActions}>
        <button onClick={onClose} className={styles.cancelButton}>
          {t('Cancel')}
        </button>
        <button
          onClick={onGenerate}
          disabled={aiGenerating}
          className={styles.okayButton}
        >
          {aiGenerating ? t('Generating...') : t('OKAY')}
        </button>
      </div>
    </Modal>
  );
};