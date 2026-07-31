import {useEffect} from 'react';
import {Linking} from 'react-native';
import {parseDeepLink} from '../../navigation/deep-links';
import {openTarget} from '../../navigation/navigation-ref';

/**
 * Renders nothing. Turns an opened `mahem://…` link into a screen.
 *
 * Two entry points, because the OS reports them differently: `getInitialURL`
 * for a link that launched the app from cold, and the `url` event for one that
 * arrived while it was already running. openTarget handles the ordering
 * problem in both cases — the cold-start URL resolves long before there is a
 * navigator to receive it.
 */
export function DeepLinkBridge() {
  useEffect(() => {
    let cancelled = false;

    const handle = (url: string | null | undefined) => {
      const target = parseDeepLink(url);
      if (target) {
        openTarget(target);
      }
    };

    Linking.getInitialURL()
      .then(url => {
        if (!cancelled) {
          handle(url);
        }
      })
      .catch(() => {
        // No initial URL, or the platform refused to report one — the app
        // simply opens on its normal first screen.
      });

    const subscription = Linking.addEventListener('url', ({url}) =>
      handle(url),
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return null;
}
