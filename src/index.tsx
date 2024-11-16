import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

import { Root } from './components/Root.tsx';
import { EnvUnsupported } from './components/EnvUnsupported.tsx';
import { init } from './init.ts';
import './i18n';
import 'regenerator-runtime/runtime';


import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.scss';

import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  // Configure all application dependencies.
  init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

  root.render(
    <StrictMode>
      <Root/>
    </StrictMode>,
  );
} catch (e) {
  root.render(<EnvUnsupported/>);
}
