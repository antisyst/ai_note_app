import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import styles from './Dropdown.module.scss';

interface DropdownOption {
  code: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selected: string;
  onSelect: (code: string) => void;
  label: string;
}

export const Dropdown: FC<DropdownProps> = ({ options, selected, onSelect, label }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (code: string) => {
    onSelect(code);
    setDropdownOpen(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const dropdownTransition = {
    duration: 0.2,
    ease: 'easeInOut',
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={styles.dropdownButton}
      >
        <p>{options.find((option) => option.code === selected)?.label || label}</p>
        <ChevronRight />
      </button>
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            className={styles.dropdownMenu}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden" // Ensure consistent "exit" state
            transition={dropdownTransition} // Use consistent transition
          >
            {options.map((option) => (
              <button
                key={option.code}
                onClick={() => handleOptionSelect(option.code)}
                disabled={selected === option.code}
              >
                <p>{option.label}</p> {selected === option.code && <Check size={17} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
