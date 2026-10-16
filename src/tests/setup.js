import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  window.localStorage.clear();
  window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  window.scrollTo = () => {};
});
afterEach(() => cleanup());
