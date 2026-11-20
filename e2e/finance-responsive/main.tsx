import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Finanzas from '../../src/pages/Finanzas';
import '../../src/index.css';

// Mount the actual page and styles, with auth/database replaced only by this
// isolated test server. No real session, credentials, or network persistence.
createRoot(document.getElementById('root')!).render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Finanzas />
  </MemoryRouter>,
);
