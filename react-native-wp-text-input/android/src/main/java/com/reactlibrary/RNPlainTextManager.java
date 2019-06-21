package com.reactlibrary;

import android.support.annotation.Nullable;
import android.text.InputType;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.textinput.ReactEditText;
import com.facebook.react.views.textinput.ReactTextInputManager;

import java.util.Map;

public class RNPlainTextManager extends ReactTextInputManager {

    @Override
    public ReactEditText createViewInstance(ThemedReactContext reactContext) {
        ReactEditText editText = new WPReactEditText(reactContext);
        int inputType = editText.getInputType();
        editText.setInputType(inputType & (~InputType.TYPE_TEXT_FLAG_MULTI_LINE));
        editText.setReturnKeyType("done");
        return editText;
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
        final Map<String, Object> exportedCustomBubblingEventTypeConstants = super.getExportedCustomBubblingEventTypeConstants();
        exportedCustomBubblingEventTypeConstants.put(
                "topTextInputEnter",
                MapBuilder.of(
                        "phasedRegistrationNames",
                        MapBuilder.of("bubbled", "onEnter")));
        return exportedCustomBubblingEventTypeConstants;
    }

    @Override
    public String getName() {
        return "RNPlainText";
    }
}
