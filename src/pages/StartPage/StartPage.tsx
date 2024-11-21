import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import styles from './Startpage.module.scss';

export const StartPage: FC = () => {
  const navigate = useNavigate();
  const initDataState = useSignal(initData.state);

  const handleStartClick = () => {
    const user = initDataState?.user;
    if (user) {
      localStorage.setItem('userId', user.id.toString());
      navigate('/index');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      navigate('/index');
    }
  }, [navigate]);

  return (
    <div className={styles['start-page-layout']}>
      <div className={styles['start-page-content-container']}>
        <h1 className={styles['name']}>Notelytic</h1>
        <p>Welcome! Your personal AI-powered note-taking assistant. Create content and get inspiration with AI assistance!</p>
      </div>
      <button onClick={handleStartClick} className={styles['get-started-button']}>
        Get Started
      </button>
    </div>
  );
};
