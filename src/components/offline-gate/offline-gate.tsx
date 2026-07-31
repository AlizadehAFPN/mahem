import React from 'react';
import {Modal} from 'react-native';
import {useIsOffline} from '../../hooks/use-is-offline';
import {NoInternetScreen} from '../../screens/others/no-internet/no-internet-screen';

// Mounted once at the very top of the app (App.tsx), above every navigator:
// «نبود نت» has to cover whatever screen the user happens to be on the moment
// the connection drops — including the launch splash and the auth stack — and
// come off by itself when it returns. A route couldn't do that: routes are
// per-stack, they only cover the screen below them, and something would have to
// remember to pop them.
//
// A native Modal rather than an absolutely-positioned overlay, because this app
// opens RN Modals everywhere (pickers, filters, city select, image-source
// sheets) and each one is its own native window — an in-tree overlay renders
// *under* whichever of them is open, leaving it fully usable.
export function OfflineGate() {
  const isOffline = useIsOffline();

  return (
    <Modal
      visible={isOffline}
      animationType="fade"
      // Cover the status bar area too (Android; iOS full-screen modals already
      // do), so the artwork is genuinely full-bleed.
      statusBarTranslucent
      hardwareAccelerated
      // Swallow Android's hardware back button: there is nothing to go back to
      // — every screen behind this one needs the network, and the gate closes
      // itself as soon as there is one.
      onRequestClose={() => {}}>
      <NoInternetScreen />
    </Modal>
  );
}
