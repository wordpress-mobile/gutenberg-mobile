package com.gutenberg;

import android.os.Bundle;
import android.view.KeyEvent;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactApplication;

import org.wordpress.mobile.ReactNativeGutenbergBridge.RNReactNativeGutenbergBridgeModule;
import org.wordpress.mobile.ReactNativeGutenbergBridge.RNReactNativeGutenbergBridgeModule.Shortcut;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "gutenberg";
    }

    private RNReactNativeGutenbergBridgeModule module;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ((ReactApplication) getApplication()).getReactNativeHost()
                .getReactInstanceManager()
                .addReactInstanceEventListener(context -> module = context.getNativeModule(RNReactNativeGutenbergBridgeModule.class));
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (!event.isCtrlPressed()) {
            return super.onKeyUp(keyCode, event);
        }
        switch (event.getKeyCode()) {
            case KeyEvent.KEYCODE_B:
                module.emitShortcutEventToJs(Shortcut.Bold);
                break;
            case KeyEvent.KEYCODE_I:
                module.emitShortcutEventToJs(Shortcut.Italic);
                break;
            case KeyEvent.KEYCODE_K:
                module.emitShortcutEventToJs(Shortcut.AddEditLink);
                break;
        }
        return super.onKeyUp(keyCode, event);
    }
}
