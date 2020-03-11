package org.wordpress.mobile.react_native_overflow_view

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewManager

class OverflowViewManager: ReactViewManager() {
    val REACT_CLASS = "RNTOverflowView"

    override fun createViewInstance(reactContext: ThemedReactContext): OverflowView {
        return OverflowView(reactContext)
    }

    override fun getName(): String {
        return REACT_CLASS
    }
}