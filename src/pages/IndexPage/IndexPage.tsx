import React, { FC, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import { Search, Plus } from 'lucide-react';
import { Page } from '../../components/Page';
import { NoteItem } from '@/components/NoteItem/NoteItem';
import styles from './IndexPage.module.scss';
import { useTranslation } from 'react-i18next';

const INTRO_NOTE_ID = '1';
const INTRO_NOTE = {
  title: "Welcome to Notelytic! Unlock the Power of AI in Note-Taking",
  content: "Welcome to Notelytic, your personal AI-powered note-taking assistant! 🌟\n\n" +
           "With Notelytic, you can:\n\n" +
           "✨ **Create or Edit Notes with AI Assistance**\nGet inspired and let AI help you write or refine your thoughts.\n\n" +
           "🎨 **Choose Custom Themes**\nPersonalize your notes with beautiful themes that suit your style.\n\n" +
           "📅 **Organize Effortlessly**\nEfficiently categorize and find your notes, so you never lose track.\n\n" +
           "Get started now and unlock a new level of productivity and creativity with Notelytic!"
};

const getNotes = () => {
  const savedNotes = localStorage.getItem('notes');
  return savedNotes ? JSON.parse(savedNotes) : {};
};

const saveNotesToLocalStorage = (notes: Record<string, { title: string; content: string; isPinned?: boolean }>) => {
  localStorage.setItem('notes', JSON.stringify(notes));
};

export const IndexPage: FC = () => {
  const navigate = useNavigate();
  const initDataState = useSignal(initData.state);
  const { t } = useTranslation();
  const user = initDataState?.user;

  const [notes, setNotes] = useState<Record<string, { title: string; content: string; isPinned?: boolean }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    
    const loadNotes = () => {
      const existingNotes = getNotes();
      if (!existingNotes[INTRO_NOTE_ID]) {
        existingNotes[INTRO_NOTE_ID] = INTRO_NOTE;
        saveNotesToLocalStorage(existingNotes);
      }
      const sortedNotes = Object.entries(existingNotes).sort(([, a], [, b]) => {
        const noteA = a as { title: string; content: string; isPinned?: boolean };
        const noteB = b as { title: string; content: string; isPinned?: boolean };
        return (noteB.isPinned ? 1 : 0) - (noteA.isPinned ? 1 : 0);
      });
      setNotes(Object.fromEntries(sortedNotes) as Record<string, { title: string; content: string; isPinned?: boolean }>);
      setLoading(false);
    };

    loadNotes();

    const handleStorageChange = () => {
      loadNotes();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      const searchPosition = searchRef.current?.offsetTop || 0;
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > searchPosition);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const filteredNotes = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return Object.entries(notes).filter(([, note]) =>
      note.title.toLowerCase().includes(lowerSearchTerm) ||
      note.content.toLowerCase().includes(lowerSearchTerm)
    );
  }, [notes, searchTerm]);

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.username ? `@${user.username}` : 'User';

  const handleAddNoteClick = () => {
    navigate('/note/new');
  };

  if (loading) {
    return (
      <Page back={false}>
        <div className={styles.loadingContainer}>
          <p>{t('LoadingNotes')}</p>
        </div>
      </Page>
    );
  }

  return (
    <Page back={false}>
      <header className={`${styles.homeHeader} ${isScrolled ? styles.homeHeaderScrolled : ''}`}>
        <div className={styles.homeHeaderRowContainer}>
          <div className={styles.homeHeaderRow}>
            <span>{displayName}</span>
          </div>
          <div className={styles.homeHeaderRow}>
            <p>FREMIUM</p>
          </div>
        </div>
      </header>
      <div
        ref={searchRef}
        className={styles.searchContainer}
      >
        <input
          type="text"
          placeholder={t('SearchNotes')}
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearch}
        />
        <Search color='var(--wht)' size={25} strokeWidth={1.8}/>
      </div>
      <div ref={scrollContainerRef} className={styles.scrollContainer}>
        <div className={styles.notesList}>
          {filteredNotes.map(([id, note]) => (
            <MemoizedNoteItem
              key={id}
              title={note.title}
              content={note.content}
              id={parseInt(id)}
            />
          ))}
        </div>
      </div>
      <button className={styles.addButton} onClick={handleAddNoteClick}>
        <Plus color='var(--blck)' size={28} />
      </button>
    </Page>
  );
};

const MemoizedNoteItem = React.memo(NoteItem);