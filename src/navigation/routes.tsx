import type { ComponentType, JSX } from 'react';

import { IndexPage } from '../pages/IndexPage/IndexPage';
import { InitDataPage } from '../pages/InitDataPage.tsx';
import { StartPage } from '../pages/StartPage/StartPage';
import { SettingsPage } from '../pages/SettingsPage/SettingsPage';
import { DashboardPage } from '@/pages/DashboardPage/DashboardPage.tsx';
import { ExplorePage } from '@/pages/ExplorePage/ExplorePage.tsx';
import { NotePage } from '@/pages/NotePage/NotePage.tsx';
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage.tsx';
import { CreateNotePage } from '@/pages/CreateNotePage/CreateNotePage.tsx';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: StartPage },
  { path: '/index', Component: IndexPage },
  { path: '/settings', Component: SettingsPage },
  { path: '/dashboard', Component: DashboardPage },
  { path: '/explore', Component: ExplorePage },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/note/new', Component: CreateNotePage },
  { path: '/note/:id', Component: NotePage },
  { path: '*', Component: NotFoundPage }
];
