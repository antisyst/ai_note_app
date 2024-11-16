import { FC, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './BottomNavigation.module.scss';
import { House, Settings, ChartColumn, Compass } from 'lucide-react';

export const BottomNavigation: FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/index');
  const tabRefs = useRef<HTMLAnchorElement[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const tabs = [
    { path: '/index', label: t('Home'), icon: <House color="var(--wht)" size={33} strokeWidth={1.5} /> },
    { path: '/dashboard', label: t('Dashboard'), icon: <ChartColumn color="var(--wht)" size={33} strokeWidth={1.5} /> },
    { path: '/explore', label: t('Explore'), icon: <Compass color="var(--wht)" size={33} strokeWidth={1.5} /> },
    { path: '/settings', label: t('Settings'), icon: <Settings color="var(--wht)" size={33} strokeWidth={1.5} /> },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.path === activeTab);
  const activeTabRef = tabRefs.current[activeIndex];

  const indicatorStyle = activeTabRef
    ? {
        left: activeTabRef.offsetLeft,
        width: activeTabRef.clientWidth,
      }
    : null;

  const tabTextVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        type: 'spring',
        stiffness: 300,
        damping: 40,
      },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  };

  return (
    <nav className={styles['bottom-navigation']}>
      <div className={styles['link-container']}>
        {tabs.map((tab, index) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`${styles['bottom-link']} ${activeTab === tab.path ? styles['active'] : ''}`}
            ref={(el) => (tabRefs.current[index] = el!)}
          >
            {tab.icon}
            <motion.span
              key={tab.label}
              variants={tabTextVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {tab.label}
            </motion.span>
          </Link>
        ))}
        {indicatorStyle && (
          <motion.div
            className={styles['indicator']}
            style={indicatorStyle}
            layout
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 40,
            }}
          />
        )}
      </div>
    </nav>
  );
};
