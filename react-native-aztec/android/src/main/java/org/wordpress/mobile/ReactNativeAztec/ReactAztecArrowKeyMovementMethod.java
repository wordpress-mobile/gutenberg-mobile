package org.wordpress.mobile.ReactNativeAztec;

import android.text.Selection;
import android.text.Spannable;
import android.text.method.ArrowKeyMovementMethod;
import android.view.MotionEvent;
import android.view.View;
import android.widget.TextView;

public class ReactAztecArrowKeyMovementMethod extends ArrowKeyMovementMethod {

    private static ReactAztecText sLastFocusedField;

    private static void setLastFocusedField(ReactAztecText reactAztecText) {
        if (sLastFocusedField == null) {
            sLastFocusedField = reactAztecText;
            return;
        }

        if (sLastFocusedField != reactAztecText) {
            sLastFocusedField.setTouched(false);
            sLastFocusedField = reactAztecText;
        }
    }

    @Override
    public void onTakeFocus(TextView view, Spannable text, int dir) {
        ReactAztecText reactAztecText = (ReactAztecText)view;
        setLastFocusedField(reactAztecText);
        if ((dir & (View.FOCUS_FORWARD | View.FOCUS_DOWN)) != 0) {
            if (view.getLayout() == null) {
                // This shouldn't be null, but do something sensible if it is.
                handleSelectionOnEnd(view, text);
            }
            else if (!reactAztecText.isTouched()) {
                handleSelectionOnEnd(view, text);  // <-- setting caret to end of text after two blocks are merged
            }
        } else {
            Selection.setSelection(text, text.length());  // <-- same as original Android implementation. Not sure if we should change this too
        }
    }

    private void handleSelectionOnEnd(TextView view, final Spannable text) {
        view.postDelayed(new Runnable() {
            @Override
            public void run() {
                Selection.setSelection(text, text.length()); // <-- setting caret to end of text
            }
        }, 20);
    }

    @Override
    public boolean onTouchEvent(TextView widget, Spannable buffer, MotionEvent event) {
        ((ReactAztecText)widget).setTouched(true);
        return super.onTouchEvent(widget, buffer, event);
    }
}
