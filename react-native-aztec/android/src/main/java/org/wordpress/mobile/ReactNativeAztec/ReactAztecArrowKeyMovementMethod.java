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
        if ((dir & (View.FOCUS_FORWARD | View.FOCUS_DOWN)) != 0) {
            if (view.getLayout() == null) {
                // This shouldn't be null, but do something sensible if it is.
                if (isThisABlockBreak(view)) {
                    placeCaretBeginningOrEnd(view, text, false);
//                } else if (isThisABlockBackspaceDelete(view)){
//                    placeCaretBeginningOrEnd(view, text, true);
                } else {
                    placeCaretBeginningOrEnd(view, text, !reactAztecText.isTouched());
                }
            } else {
                if (!reactAztecText.isTouched()) {
                    placeCaretBeginningOrEnd(view, text, true);
                }
                //placeCaretBeginningOrEnd(view, text, reactAztecText.isTouched());
            }
        } else {
            Selection.setSelection(text, text.length());  // <-- same as original Android implementation. Not sure if we should change this too
        }
        setLastFocusedField(reactAztecText);
    }

    private boolean isThisABlockBreak(TextView view) {
        if (sLastFocusedField == null) {
            return false;
        }

        // last block needs to be touched, and the new one not touched
        if (sLastFocusedField.isTouched() && !((ReactAztecText)view).isTouched()) {
            // previous block focus is at the end
            int selEnd = sLastFocusedField.getSelectionEnd();
            int textLen = sLastFocusedField.getText().length();
            if (selEnd != textLen && textLen != 0) {
                return true;
            }
        }
        return false;
    }

    private boolean isThisABlockBackspaceDelete(TextView view) {
        if (sLastFocusedField == null) {
            return false;
        }

        // last block needs to be not touched, and the new one touched
        if (!sLastFocusedField.isTouched() && ((ReactAztecText)view).isTouched()) {
            return true;
        }
        return false;
    }

    private void placeCaretBeginningOrEnd(TextView view, final Spannable text, final boolean placeAtEnd) {
        view.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (placeAtEnd) {
                    Selection.setSelection(text, text.length()); // <-- setting caret to end of text
                } else {
                    Selection.setSelection(text, 0); // <-- setting caret to beginning of text
                }
            }
        }, 20);
    }

    @Override
    public boolean onTouchEvent(TextView widget, Spannable buffer, MotionEvent event) {
        ((ReactAztecText)widget).setTouched(true);
        return super.onTouchEvent(widget, buffer, event);
    }
}
