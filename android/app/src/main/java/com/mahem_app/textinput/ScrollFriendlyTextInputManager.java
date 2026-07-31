package com.mahem_app.textinput;

import android.text.InputType;
import android.view.ViewGroup;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.textinput.ReactEditText;
import com.facebook.react.views.textinput.ReactTextInputManager;

/**
 * Registers {@link ScrollFriendlyReactEditText} under React Native's own "AndroidTextInput" name,
 * which is what makes every <TextInput> in the app pick it up without a single line of JS changing
 * — including the ones inside third-party components. ViewManagerRegistry keys managers by name in
 * a plain map and the packages returned from MainApplication are registered after the core ones, so
 * this one replaces the stock manager rather than clashing with it.
 *
 * createViewInstance is upstream's, with only the view class swapped. Props, the shadow node and
 * events are all inherited untouched, so a text field behaves exactly as it did before.
 */
public class ScrollFriendlyTextInputManager extends ReactTextInputManager {

  @Override
  public ReactEditText createViewInstance(ThemedReactContext context) {
    ReactEditText editText = new ScrollFriendlyReactEditText(context);
    int inputType = editText.getInputType();
    editText.setInputType(inputType & (~InputType.TYPE_TEXT_FLAG_MULTI_LINE));
    editText.setReturnKeyType("done");
    // Default layoutParams, as upstream: without them Android throws an NPE when a prop update
    // (the placeholder) lands before the view has been laid out. RN overrides them on its first
    // commit anyway.
    editText.setLayoutParams(
        new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));
    return editText;
  }
}
