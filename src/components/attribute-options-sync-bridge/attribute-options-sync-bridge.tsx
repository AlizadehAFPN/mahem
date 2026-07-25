import {useEffect} from 'react';
import {useQueryClient} from 'react-query';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../stateManager';
import {setAttributeOptionsCache} from '../../stateManager/reducers/attribute-options';
import {ATTRIBUTE_OPTIONS_QUERY_KEY} from '../../hooks/use-cached-attribute-options';
import {
  getAllAttributeOptionsGrouped,
  getAttributeOptionsVersion,
} from '../../services';

// Renders nothing. Same pattern as CategoriesSyncBridge: admin-managed
// option lists (car brand/model, floor, education, contractType, ...) rarely
// change, so instead of every OptionPicker bottom sheet fetching its own
// type on first open (previously the actual cause of "این باتم‌شیت‌ها خیلی
// دیر لود میشن" — the sheet opened empty and only populated once that
// field's own network request resolved), this:
//   1. primes react-query's cache from the last persisted copy (redux-persist,
//      see stateManager/reducers/attribute-options.ts) so every field renders
//      instantly with no network wait, even offline;
//   2. checks the backend's cheap /attribute-options/version counter, and
//      only refetches+re-persists the full list if it has moved.
export function AttributeOptionsSyncBridge() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cached = useSelector((s: RootState) => s.attributeOptions);

  useEffect(() => {
    if (cached.optionsByGroup) {
      queryClient.setQueryData(
        ATTRIBUTE_OPTIONS_QUERY_KEY,
        cached.optionsByGroup,
      );
    }

    (async () => {
      try {
        const remoteVersion = await getAttributeOptionsVersion();
        const upToDate =
          cached.version === remoteVersion && cached.optionsByGroup;
        if (upToDate) {
          return;
        }

        const grouped = await getAllAttributeOptionsGrouped();
        queryClient.setQueryData(ATTRIBUTE_OPTIONS_QUERY_KEY, grouped);
        dispatch(
          setAttributeOptionsCache({
            version: remoteVersion,
            optionsByGroup: grouped,
          }),
        );
      } catch {
        // Offline/unreachable — keep serving whatever was already
        // cached/persisted; useAttributeOptions() will retry on its own.
      }
    })();
    // Runs once per app launch, not on every re-render — redux-persist has
    // already rehydrated `cached` by the time this bridge mounts (it's
    // rendered inside PersistGate, see App.tsx).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
