package org.wordpress.mobile.ReactNativeGutenbergBridge;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import org.jetbrains.annotations.NotNull;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class RNReactNativeGutenbergBridgePackage implements ReactPackage {
    private GutenbergBridgeJS2Parent mGutenbergBridgeJS2Parent;
    private RNReactNativeGutenbergBridgeModule mRNReactNativeGutenbergBridgeModule;

    public RNReactNativeGutenbergBridgeModule getRNReactNativeGutenbergBridgeModule() {
        return mRNReactNativeGutenbergBridgeModule;
    }

    public RNReactNativeGutenbergBridgePackage(GutenbergBridgeJS2Parent gutenbergBridgeJS2Parent) {
        mGutenbergBridgeJS2Parent = gutenbergBridgeJS2Parent;
    }

    @NotNull
    @Override
    public List<NativeModule> createNativeModules(@NotNull ReactApplicationContext reactContext) {
        mRNReactNativeGutenbergBridgeModule = new RNReactNativeGutenbergBridgeModule(reactContext,
                mGutenbergBridgeJS2Parent);
        return Arrays.asList(mRNReactNativeGutenbergBridgeModule);
    }

    @NotNull
    @Override
    public List<ViewManager> createViewManagers(@NotNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
