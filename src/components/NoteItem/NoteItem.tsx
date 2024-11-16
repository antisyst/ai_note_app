import { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './NoteItem.module.scss';

interface NoteItemProps {
  title: string;
  content: string;
  id: number;
}

export const NoteItem: FC<NoteItemProps> = ({ title, content, id }) => {
  const contentPreview = content.replace(/<[^>]+>/g, '');
  const truncatedContent = contentPreview.length > 130 ? `${contentPreview.slice(0, 130)}...` : contentPreview;

  return (
    <Link className={styles.noteItem} to={`/note/${id}`}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.content}>{truncatedContent}</p>
    </Link>
  );
};
