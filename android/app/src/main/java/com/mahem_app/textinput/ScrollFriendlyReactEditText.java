package com.mahem_app.textinput;

import android.content.Context;
import android.view.MotionEvent;
import android.view.ViewParent;

import com.facebook.react.views.textinput.ReactEditText;

/**
 * A text field you can scroll the form from.
 *
 * On ACTION_DOWN React Native's own ReactEditText tells its ancestors to stop intercepting touches,
 * so that a drag which starts inside a field scrolls the field's own text rather than the page. It
 * hands that lock back on the first ACTION_MOVE, but only once the field reports that it cannot
 * scroll in any direction — and on Android one of those four checks is broken:
 *
 *   TextView.computeHorizontalScrollRange() returns the real width of the text only for a
 *   single-line field whose horizontal gravity is LEFT. For any other gravity it returns the
 *   layout width instead, and the layout of a single-line (horizontally scrolling) field is a
 *   synthetic "very wide" one — about a million pixels. So canScrollHorizontally() answers true
 *   for every right- or center-aligned field, whether or not it holds any text at all.
 *
 * Every field in this app is right-aligned — the UI is Persian, native layout direction stays LTR
 * and the alignment comes from textAlign: 'right' — so the lock was never released and a drag that
 * began anywhere on a field could not scroll the form. It is Android-only: RCTScrollView on iOS
 * deliberately returns YES from touchesShouldCancelInContentView: for exactly this case. See
 * facebook/react-native#26526, #16206 and #12167.
 *
 * The fix is to hand the lock back as soon as we know the field has nothing to scroll vertically.
 * A single-line field never has, so a vertical drag on one always reaches the ScrollView; a
 * multiline field holding more text than fits keeps the gesture and scrolls itself, which is the
 * case the lock exists for. Horizontal scrollability is deliberately not consulted: a vertical
 * ScrollView only claims a drag once it has travelled vertically past the touch slop, so dragging
 * text sideways inside a field is unaffected by giving the lock back.
 */
public class ScrollFriendlyReactEditText extends ReactEditText {

  /** True until the decision below has been made for the gesture in progress. */
  private boolean mAwaitingScrollDecision;

  public ScrollFriendlyReactEditText(Context context) {
    super(context);
  }

  @Override
  public boolean onTouchEvent(MotionEvent ev) {
    switch (ev.getActionMasked()) {
      case MotionEvent.ACTION_DOWN:
        mAwaitingScrollDecision = true;
        break;
      case MotionEvent.ACTION_MOVE:
        if (mAwaitingScrollDecision) {
          mAwaitingScrollDecision = false;
          if (!canScrollVertically(-1) && !canScrollVertically(1)) {
            ViewParent parent = getParent();
            if (parent != null) {
              parent.requestDisallowInterceptTouchEvent(false);
            }
          }
        }
        break;
      default:
        break;
    }
    // super runs its own copy of this afterwards: on DOWN it takes the lock — which is the one
    // released above — and on MOVE its broken check can only ever release the lock, never re-take
    // it, so it cannot undo the decision.
    return super.onTouchEvent(ev);
  }
}
