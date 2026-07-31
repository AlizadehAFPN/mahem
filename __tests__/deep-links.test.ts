/**
 * Deep links are the one route into the app whose input the app doesn't
 * control — it arrives from a messenger, an SMS, a tapped notification — so
 * the parser has to map the shapes the app itself emits and refuse everything
 * else rather than navigating somewhere arbitrary.
 *
 * The params each case produces are not arbitrary either: they have to match
 * what the destination screen reads off the route, or the link opens a screen
 * that immediately renders empty. Those shapes are asserted here.
 */
import {
  buildAdLink,
  buildJobLink,
  buildStoreLink,
  parseDeepLink,
} from '../src/navigation/deep-links';

describe('deep links', () => {
  it('round-trips the links the app shares', () => {
    expect(parseDeepLink(buildAdLink('ad-1'))).toEqual({
      route: 'singleProduct',
      // SingleProductScreen reads params.ads.id — not params.id.
      params: {ads: {id: 'ad-1'}},
    });
    expect(parseDeepLink(buildStoreLink('store-1'))).toEqual({
      route: 'storeProfile',
      params: {storeId: 'store-1'},
    });
    expect(parseDeepLink(buildJobLink('job-1'))).toEqual({
      route: 'singleJob',
      // SingleJobScreen reads params.job.id, and fetches the rest.
      params: {job: {id: 'job-1'}},
    });
  });

  it('ignores anything a campaign or messenger appends to the link', () => {
    expect(parseDeepLink('mahem://ad/ad-1?utm_source=sms')).toEqual({
      route: 'singleProduct',
      params: {ads: {id: 'ad-1'}},
    });
    expect(parseDeepLink('mahem://ad/ad-1#top')).toEqual({
      route: 'singleProduct',
      params: {ads: {id: 'ad-1'}},
    });
  });

  it('refuses to navigate on anything it does not recognise', () => {
    // No id, unknown kind, empty, or a link that isn't ours at all — each has
    // to return null so DeepLinkBridge leaves the app on its normal screen
    // instead of pushing a route with a missing param.
    expect(parseDeepLink('mahem://ad')).toBeNull();
    expect(parseDeepLink('mahem://ad/')).toBeNull();
    expect(parseDeepLink('mahem://unknown/1')).toBeNull();
    expect(parseDeepLink('https://example.com/ad/1')).toBeNull();
    expect(parseDeepLink('')).toBeNull();
    expect(parseDeepLink(null)).toBeNull();
    expect(parseDeepLink(undefined)).toBeNull();
  });
});
