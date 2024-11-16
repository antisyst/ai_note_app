import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dropdown } from '@/components/Dropdown/Dropdown';
import { languages, speechLanguages } from '@/constants/languages';
import styles from './SettingsPage.module.scss';

export const SettingsPage: FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const initialLanguage = localStorage.getItem('appLanguage') || i18n.language;
  const initialSpeechLanguage = localStorage.getItem('speechLanguage') || 'en-US';
  const [language, setLanguage] = useState(initialLanguage);
  const [speechLanguage, setSpeechLanguage] = useState(initialSpeechLanguage);
  const [saveButtonText, setSaveButtonText] = useState(t('Save'));

  useEffect(() => {
    i18n.changeLanguage(initialLanguage);
  }, [initialLanguage, i18n]);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setSaveButtonText(i18n.getFixedT(lang)('Save'));
  };

  const handleSpeechLanguageSelect = (lang: string) => {
    setSpeechLanguage(lang);
  };

  const handleSave = () => {
    if (language !== initialLanguage) {
      i18n.changeLanguage(language);
      localStorage.setItem('appLanguage', language);
    }
    localStorage.setItem('speechLanguage', speechLanguage);
    setSaveButtonText(t('Save'));
    navigate('/index');
  };

  const buttonTextVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, type: 'spring', stiffness: 150 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsHeader}>
        <h1>{t('SettingsTitle')}</h1>
        <p>{t('SettingsDescription')}</p>
      </div>
      <div className={styles.settingsLayout}>
        <div className={styles.settingsLang}>
          <p className={styles.settingsLangLabel}>{t('Language')}</p>
          <Dropdown
            options={languages}
            selected={language}
            onSelect={handleLanguageSelect}
            label="Select Language"
          />
        </div>
        <div className={styles.settingsLang}>
          <p className={styles.settingsLangLabel}>Speech Recognition Language</p>
          <Dropdown
            options={speechLanguages}
            selected={speechLanguage}
            onSelect={handleSpeechLanguageSelect}
            label="Select Speech Language"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className={styles.saveButton}
        disabled={language === initialLanguage && speechLanguage === initialSpeechLanguage}
      >
        <motion.span
          key={saveButtonText}
          variants={buttonTextVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {saveButtonText}
        </motion.span>
      </button>
    </div>
  );
};
