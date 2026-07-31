/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shiped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

// A smoke test, and the only one that walks the whole module graph — every
// screen, every native module App reaches. It is what caught the Jest
// transform gaps that made this suite fail while the other 18 passed (see
// jest.config.js), so it earns its keep even without assertions: if App
// cannot be imported and mounted, nothing else is worth checking.
it('renders correctly', () => {
  // Unmounted, not left running: PersistGate starts redux-persist, whose
  // writes are scheduled on a timer, and a live handle after the run makes
  // Jest force-kill the worker.
  const tree = renderer.create(<App />);
  tree.unmount();
});
