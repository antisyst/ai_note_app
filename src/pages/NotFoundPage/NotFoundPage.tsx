import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFound}>
      <h1>404 - Note Not Found</h1>
      <p>The note you are looking for does not exist.</p>
      <button onClick={() => navigate('/index')} className={styles.backButton}>Back to Home</button>
    </div>
  );
};
