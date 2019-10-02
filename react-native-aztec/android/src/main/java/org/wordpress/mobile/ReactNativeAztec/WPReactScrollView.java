package org.wordpress.mobile.ReactNativeAztec;

import android.os.Build;
import android.view.View;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.views.scroll.ReactScrollView;

public class WPReactScrollView extends ReactScrollView {
    public WPReactScrollView(ReactContext context) {
        super(context, null);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            && Build.VERSION.SDK_INT <= Build.VERSION_CODES.O_MR1) {
            setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }
    }
}
