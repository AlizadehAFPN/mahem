// Where tapping a row in پیام‌ها should land. Notifications carry an
// entityType/entityId pair pointing at whatever the message is about (see the
// backend's NotificationsService.create call sites), so a tap can go straight
// to that thing instead of the generic full-text screen — a chat message opens
// the conversation, an approval/rejection opens the listing it approved or
// rejected. Anything without a resolvable target (ADMIN_MESSAGE, and any
// entityType added server-side before this list catches up) falls back to the
// full-text view, which is what every notification used to do.
//
// Only ids are passed along; each destination screen fetches the rest itself.
// That keeps the tap instant instead of blocking on a request first, and means
// the screen shows fresh data — an ad rejected a week ago may since have been
// edited and re-approved.
export function resolveNotificationTarget(item: any): {
  route: string;
  params?: Record<string, unknown>;
} {
  const entityId = item?.entityId;
  if (!entityId) {
    return {route: 'notifDetail', params: {item}};
  }

  switch (item?.entityType) {
    case 'Conversation':
      return {route: 'chat', params: {conversationId: entityId}};
    case 'Advertisement':
      return {route: 'singleProduct', params: {ads: {id: entityId}}};
    case 'Job':
      return {route: 'singleJob', params: {job: {id: entityId}}};
    // Store notifications only ever go to the store's own owner, so the
    // owner-side dashboard is the right target — the public store profile
    // hides a store that isn't approved, which is exactly the case a
    // STORE_REJECTED message needs to show.
    case 'Store':
      return {route: 'myStore'};
    default:
      return {route: 'notifDetail', params: {item}};
  }
}
