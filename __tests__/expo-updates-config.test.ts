/**
 * expo-updates is configured in three places that nothing keeps in sync: the
 * Expo config (app.json) and, because this is a bare project, the two native
 * files that are what the installed app actually reads at runtime — iOS's
 * Expo.plist and Android's AndroidManifest.xml/strings.xml. app.json only
 * reaches the binary through `expo prebuild`, which this project does not run
 * on every build, so the native values silently become the truth.
 *
 * `runtimeVersion` drifting is the expensive one: it is the compatibility
 * contract between the JS bundle EAS Update serves and the binary running it.
 * Left at a hardcoded "1.0.0" through many native changes, it let every
 * `eas update` reach builds whose binaries lacked the native modules and fonts
 * the new bundle expected — and since expo-updates applies a downloaded update
 * on the *next* launch and keeps it, the result survived every restart and only
 * a reinstall recovered it.
 */
import {readFileSync} from 'fs';
import {join} from 'path';

const root = join(__dirname, '..');
const read = (relativePath: string) =>
  readFileSync(join(root, relativePath), 'utf8');

const appJson = JSON.parse(read('app.json'));
const plist = read('ios/mahem_app/Supporting/Expo.plist');
const strings = read('android/app/src/main/res/values/strings.xml');
const manifest = read('android/app/src/main/AndroidManifest.xml');

// <key>NAME</key> followed by <string>VALUE</string>, ignoring the comments and
// whitespace between them.
function plistString(key: string): string | undefined {
  return plist.match(
    new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`),
  )?.[1];
}

function androidMeta(name: string): string | undefined {
  return manifest.match(
    new RegExp(
      `android:name="expo\\.modules\\.updates\\.${name}"\\s+android:value="([^"]*)"`,
    ),
  )?.[1];
}

// app.json's `checkAutomatically` and the native `checkOnLaunch` describe the
// same setting under different names (Updates.types.d.ts vs UpdatesConfig).
const CHECK_AUTOMATICALLY_TO_NATIVE: Record<string, string> = {
  ON_LOAD: 'ALWAYS',
  ON_ERROR_RECOVERY: 'ERROR_RECOVERY_ONLY',
  WIFI_ONLY: 'WIFI_ONLY',
  NEVER: 'NEVER',
};

describe('expo-updates configuration', () => {
  it('keeps OTA updates off on both platforms', () => {
    // Not a style preference: while this is false the app can only ever run the
    // bundle embedded in the build, which is what makes a mismatched publish
    // unable to reach anyone. `expo prebuild` regenerates both native files
    // from app.json, so a stray re-enable there would silently switch OTA back
    // on for the next build — this is what notices.
    expect(appJson.expo.updates.enabled).toBe(false);
    expect(plist).toMatch(/<key>EXUpdatesEnabled<\/key>\s*<false\/>/);
    expect(androidMeta('ENABLED')).toBe('false');
  });

  it('declares the same runtimeVersion in app.json, iOS and Android', () => {
    const expected = appJson.expo.runtimeVersion;
    expect(typeof expected).toBe('string');
    expect(plistString('EXUpdatesRuntimeVersion')).toBe(expected);
    expect(
      strings.match(
        /<string name="expo_runtime_version">([^<]*)<\/string>/,
      )?.[1],
    ).toBe(expected);
  });

  it('resolves Android runtimeVersion through the strings.xml this test checks', () => {
    // The manifest points at @string/expo_runtime_version rather than holding
    // the value inline; if that indirection is ever replaced with a literal,
    // the assertion above would be checking a file nothing reads.
    expect(androidMeta('EXPO_RUNTIME_VERSION')).toBe(
      '@string/expo_runtime_version',
    );
  });

  it('applies the same update-check policy on both platforms', () => {
    const expected =
      CHECK_AUTOMATICALLY_TO_NATIVE[appJson.expo.updates.checkAutomatically];
    expect(expected).toBeDefined();
    expect(plistString('EXUpdatesCheckOnLaunch')).toBe(expected);
    expect(androidMeta('EXPO_UPDATES_CHECK_ON_LAUNCH')).toBe(expected);
  });

  it('points both platforms at the same update URL and channel', () => {
    expect(plistString('EXUpdatesURL')).toBe(appJson.expo.updates.url);
    expect(androidMeta('EXPO_UPDATE_URL')).toBe(appJson.expo.updates.url);

    const channel = appJson.expo.updates.requestHeaders['expo-channel-name'];
    expect(plist).toContain(`<string>${channel}</string>`);
    expect(androidMeta('UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY')).toContain(
      channel,
    );
  });
});
