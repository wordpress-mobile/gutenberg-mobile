package com.reactlibrary;

import android.text.InputType;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.textinput.ReactEditText;
import com.facebook.react.views.textinput.ReactTextInputManager;

public class RNPlainTextManager extends ReactTextInputManager {


    @Override
    public ReactEditText createViewInstance(ThemedReactContext reactContext) {
        ReactEditText editText = new WPReactEditText(reactContext);
        int inputType = editText.getInputType();
        editText.setInputType(inputType & (~InputType.TYPE_TEXT_FLAG_MULTI_LINE));
        editText.setReturnKeyType("done");
        return editText;
    }

    @Override
    public String getName() {
        return "RNPlainText";
    }
}
