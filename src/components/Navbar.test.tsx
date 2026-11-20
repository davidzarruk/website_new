import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import Navbar from './Navbar';
const auth = vi.hoisted(() => ({ user: null as null | { id: string } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }));
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let root: ReturnType<typeof createRoot>;
let host: HTMLDivElement;
afterEach(async () => { await act(async () => root?.unmount()); host?.remove(); auth.user = null; });
async function mount() { host = document.createElement('div'); document.body.append(host); root = createRoot(host); await act(async () => root.render(<Navbar />)); }
it('shows a text login link in the mobile header with the menu closed', async () => {
 await mount();
 const link = host.querySelector('a[data-mobile-auth]');
 expect(link?.textContent).toContain('Ingresar');
 expect(link?.getAttribute('href')).toBe('/login');
 expect(link?.closest('ul')).toBeNull();
 expect(host.querySelector('[id="mobile-navigation"]')).toBeNull();
});
it('shows private area instead of login for an authenticated user', async () => {
 auth.user = { id: 'test' }; await mount();
 const link = host.querySelector('a[data-mobile-auth]');
 expect(link?.textContent).toContain('Mi área');
 expect(link?.getAttribute('href')).toBe('/private');
});
it('labels and expands the mobile menu accessibly', async () => {
 await mount(); const toggle = host.querySelector('button[aria-controls="mobile-navigation"]')!;
 expect(toggle).not.toBeNull(); expect(toggle.getAttribute('aria-expanded')).toBe('false');
 await act(async () => (toggle as HTMLButtonElement).click());
 expect(toggle.getAttribute('aria-expanded')).toBe('true');
 expect(host.querySelector('#mobile-navigation')).not.toBeNull();
 await act(async () => host.querySelector<HTMLAnchorElement>('#mobile-navigation a')!.click());
 expect(toggle.getAttribute('aria-expanded')).toBe('false');
});
