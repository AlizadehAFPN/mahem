import {Share} from 'react-native';

/**
 * The app's share sheet.
 *
 * It used to be a thin pass-through with placeholder defaults — 'MESSAGE',
 * 'SUBJECT', 'TITLE', 'https://google.com' — and, worse, it accepted a `url`
 * argument that it never handed to Share.share. So the share button on an ad
 * offered the recipient a bare line of text with no way to reach the thing
 * being shared.
 *
 * A share is now composed: the descriptive line, then the deep link, so the
 * message says what it is *and* can be opened. See deep-links.ts for why that
 * link is a custom scheme today and what changes once a domain exists.
 */
export interface ShareRequest {
  /** The human-readable line — an ad title, a store name. */
  message: string;
  /**
   * Deep link to the thing being shared, built by deep-links.ts. Optional:
   * some callers share the app itself rather than one listing.
   */
  link?: string;
  /** Android's chooser title. Ignored on iOS. */
  dialogTitle?: string;
}

export const SocialShare = ({message, link, dialogTitle}: ShareRequest) => {
  const body = link ? `${message}\n${link}` : message;

  // A rejection here is the user dismissing the sheet, not a failure.
  return Share.share({message: body}, {dialogTitle}).catch(() => undefined);
};
