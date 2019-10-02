package org.wordpress.mobile.ReactNativeAztec;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.scroll.ReactScrollView;
import com.facebook.react.views.scroll.ReactScrollViewManager;

public class WPScrollViewManager extends ReactScrollViewManager {
    @Override
    public ReactScrollView createViewInstance(ThemedReactContext context) {
        return new WPReactScrollView(context);
    }

    @Override
    public String getName() {
        return "WPScrollView";
    }
}
