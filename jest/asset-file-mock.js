/**
 * Stand-in for binary font files under Jest.
 *
 * @expo/vector-icons imports its .ttf next to the icon set (see
 * @expo/vector-icons/src/Ionicons.ts), and Jest has no transformer for a
 * font — the react-native preset's asset transformer covers images only — so
 * it tried to parse the font as JavaScript. Metro resolves these to an asset
 * reference at build time; a string is the equivalent stand-in here, and
 * nothing under test reads it.
 */
module.exports = 'font-file-stub';
