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
                Selection.setSelection(text, 0); // <-- setting caret to start of text
            }
            else if (!reactAztecText.isTouched()) {
                Selection.setSelection(text, text.length()); // <-- setting caret to end of text when two blocks are merged
            }
        } else {
            Selection.setSelection(text, text.length());  // <-- same as original Android implementation. Not sure if we should change this too
        }
    }

    @Override
    public boolean onTouchEvent(TextView widget, Spannable buffer, MotionEvent event) {
        ((ReactAztecText)widget).setTouched(true);
        return super.onTouchEvent(widget, buffer, event);
    }
}
