import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../stateManager';
import {setSentryUser} from '../../services/sentry';

/**
 * Renders nothing. Keeps Sentry's notion of "who" in step with the store, so a
 * crash report can be matched to the account that hit it — and, on logout, so
 * the next person using the same phone isn't reported as the previous one.
 *
 * Only the account id is sent; see setSentryUser.
 */
export function SentryUserBridge() {
  const userId = useSelector((s: RootState) => s.user.id);

  useEffect(() => {
    setSentryUser(userId);
  }, [userId]);

  return null;
}
