import { FC } from 'react';
import styles from './LoadingOverlay.module.scss';
import LoaderSpinner from '../../assets/spinner.svg';

export const LoadingOverlay: FC = () => (
  <div className={styles['loading-overlay']}>
     <img src={LoaderSpinner} alt="Loader" />
  </div>
);
