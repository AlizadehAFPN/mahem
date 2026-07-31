import {NavigationTarget} from './navigation-ref';

/**
 * The app's own URL scheme, registered natively in AndroidManifest.xml
 * (intent-filter) and Info.plist (CFBundleURLTypes).
 *
 * A custom scheme rather than an https:// link because Universal Links / App
 * Links require a domain that serves an association file, and this deployment
 * has no registered domain yet. The trade-off is real and worth stating: most
 * messengers only auto-link http(s), so `mahem://ad/<id>` arrives as plain
 * text the recipient has to tap-and-hold or paste. Shared messages therefore
 * carry a human-readable line as well (see social-share.ts), so they still say
 * something useful to someone who doesn't have the app.
 *
 * When a domain exists, keep this scheme working (installed builds will still
 * be sending these links) and add the https:// host alongside it.
 */
export const DEEP_LINK_SCHEME = 'mahem';

/**
 * Where someone without the app should go to get it — the link behind
 * "معرفی به دوستان" in منو and "امتیاز به ماهم" in تنظیمات.
 *
 * Empty because the app has no store listing yet. Both call sites treat an
 * empty value as "no link" and degrade to text rather than sending anyone to
 * a wrong page: they each used to hardcode
 * https://cafebazaar.ir/app/com.turner.asmajormayhem — an unrelated game left
 * over from the template. Fill this in once the app is published, and both
 * follow.
 */
export const APP_STORE_URL = '';

export const buildAdLink = (adId: string) => `${DEEP_LINK_SCHEME}://ad/${adId}`;
export const buildStoreLink = (storeId: string) =>
  `${DEEP_LINK_SCHEME}://store/${storeId}`;
export const buildJobLink = (jobId: string) =>
  `${DEEP_LINK_SCHEME}://job/${jobId}`;

/**
 * Map an incoming deep link onto a screen, or null if it isn't one of ours.
 *
 * Params are shaped to match what each screen already reads off the route, so
 * a link lands on exactly the state a tap inside the app would produce — the
 * screens fetch the rest from the id themselves (see SingleProductScreen's
 * `singleAd` query and SingleJobScreen's `singleJob` one).
 */
export function parseDeepLink(
  url: string | null | undefined,
): NavigationTarget | null {
  if (!url) {
    return null;
  }

  const withoutScheme = url.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
  // Drop any query string / fragment before splitting, so `ad/123?from=sms`
  // resolves the same as `ad/123`.
  const [path] = withoutScheme.split(/[?#]/);
  const [kind, id] = path.split('/').filter(Boolean);

  if (!kind || !id) {
    return null;
  }

  switch (kind) {
    case 'ad':
      return {route: 'singleProduct', params: {ads: {id}}};
    case 'store':
      return {route: 'storeProfile', params: {storeId: id}};
    case 'job':
      return {route: 'singleJob', params: {job: {id}}};
    default:
      return null;
  }
}
