import { useCallback, useEffect, useState } from 'react';

interface Note {
  title: string;
  content: string;
}

const getNotes = (): Record<string, Note> => {
  const savedNotes = localStorage.getItem('notes');
  return savedNotes ? JSON.parse(savedNotes) : {};
};

const saveToLocalStorage = (notes: Record<string, Note>) => {
  localStorage.setItem('notes', JSON.stringify(notes));
};

export const useNote = (id: string) => {
  const [notes, setNotes] = useState(getNotes);
  const [title, setTitle] = useState(notes[id]?.title || '');
  const [content, setContent] = useState(notes[id]?.content || '');

  const saveNotes = useCallback(
    ({ title, content }: Note) => {
      const updatedNotes = { ...notes, [id]: { title, content } };
      saveToLocalStorage(updatedNotes);
      setNotes(updatedNotes);
    },
    [notes, id]
  );

  useEffect(() => {
    setTitle(notes[id]?.title || '');
    setContent(notes[id]?.content ?? '');
  }, [id, notes]);

  return { title, setTitle, content, setContent, saveNotes };
};
