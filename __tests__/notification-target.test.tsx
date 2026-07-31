/**
 * Tapping a row in پیام‌ها used to always open the generic full-text screen.
 * Now it follows the notification's entityType/entityId to the thing the
 * message is actually about, and only falls back to the full-text view when
 * there is nothing to follow — the case that must keep working, since every
 * ADMIN_MESSAGE lands there.
 */
import {resolveNotificationTarget} from '../src/screens/others/notif/notification-target';

describe('resolveNotificationTarget', () => {
  it('opens the conversation for a chat message', () => {
    expect(
      resolveNotificationTarget({
        type: 'NEW_CHAT_MESSAGE',
        entityType: 'Conversation',
        entityId: 'conv-1',
      }),
    ).toEqual({route: 'chat', params: {conversationId: 'conv-1'}});
  });

  it('opens the listing for an approved or rejected ad', () => {
    const approved = resolveNotificationTarget({
      type: 'ADVERTISEMENT_APPROVED',
      entityType: 'Advertisement',
      entityId: 'ad-1',
    });
    const rejected = resolveNotificationTarget({
      type: 'ADVERTISEMENT_REJECTED',
      entityType: 'Advertisement',
      entityId: 'ad-1',
    });
    // Both statuses go to the same screen — it renders the rejection reason
    // itself, so the notification doesn't need to branch.
    expect(approved).toEqual({
      route: 'singleProduct',
      params: {ads: {id: 'ad-1'}},
    });
    expect(rejected).toEqual(approved);
  });

  it('opens the posting for a job decision', () => {
    expect(
      resolveNotificationTarget({
        type: 'JOB_REJECTED',
        entityType: 'Job',
        entityId: 'job-1',
      }),
    ).toEqual({route: 'singleJob', params: {job: {id: 'job-1'}}});
  });

  it('opens the owner dashboard for a store decision', () => {
    // Not the public store profile: that hides a store that isn't approved,
    // which is exactly the case STORE_REJECTED needs to show.
    expect(
      resolveNotificationTarget({
        type: 'STORE_REJECTED',
        entityType: 'Store',
        entityId: 'store-1',
      }),
    ).toEqual({route: 'myStore'});
  });

  it('falls back to the full-text view for a plain admin message', () => {
    const item = {type: 'ADMIN_MESSAGE', title: 'تست', body: 'تست'};
    expect(resolveNotificationTarget(item)).toEqual({
      route: 'notifDetail',
      params: {item},
    });
  });

  it('falls back when an entityType is known but the id is missing', () => {
    const item = {type: 'ADVERTISEMENT_APPROVED', entityType: 'Advertisement'};
    expect(resolveNotificationTarget(item)).toEqual({
      route: 'notifDetail',
      params: {item},
    });
  });

  it('falls back for an entityType the app does not know yet', () => {
    // The backend can add notification kinds ahead of an app release; an
    // unrecognized one must still open something rather than navigate nowhere.
    const item = {entityType: 'Invoice', entityId: 'inv-1'};
    expect(resolveNotificationTarget(item)).toEqual({
      route: 'notifDetail',
      params: {item},
    });
  });
});
