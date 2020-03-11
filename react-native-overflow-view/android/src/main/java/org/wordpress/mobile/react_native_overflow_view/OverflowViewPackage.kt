package org.wordpress.mobile.react_native_overflow_view

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext

class OverflowViewPackage: ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<OverflowViewManager> {
        return mutableListOf(OverflowViewManager())
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return emptyList<NativeModule>().toMutableList()
    }
}