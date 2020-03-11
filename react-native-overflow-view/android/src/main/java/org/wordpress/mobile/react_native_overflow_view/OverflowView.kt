package org.wordpress.mobile.react_native_overflow_view

import android.content.Context
import android.graphics.Point
import android.graphics.Rect
import android.view.View
import android.view.ViewGroup
import androidx.core.graphics.contains
import com.facebook.react.uimanager.ReactCompoundViewGroup
import com.facebook.react.views.view.ReactViewGroup

class OverflowView(context: Context) : ReactViewGroup(context), ReactCompoundViewGroup {

    override fun interceptsTouchEvent(touchX: Float, touchY: Float): Boolean {
        return false
    }

    override fun reactTagForTouch(touchX: Float, touchY: Float): Int {
        val touch = normalizePoint(touchX.toInt(), touchY.toInt())
        val targetView = hitTest(this, touch) ?: id
        
        return targetView
    }

    fun hitTest(viewGroup:ViewGroup, touch: Point): Int? {

        for (i in 0.until(viewGroup.childCount)) {
            val child = viewGroup.getChildAt(i)
            var nestedId: Int? = null
            if (child is ViewGroup && child.childCount > 0) {
                nestedId = hitTest(child, touch)
            }

            if (nestedId != null) {
                return nestedId
            } else if (viewContainsTouch(child, touch)) {
                return child.id
            }
        }

        if (viewContainsTouch(viewGroup, touch)) {
            return viewGroup.id
        }

        return null
    }

    private fun viewContainsTouch(view: View, touch: Point): Boolean {
        val hitRect = Rect()
        view.getGlobalVisibleRect(hitRect)
        return hitRect.contains(touch)
    }

    private fun normalizePoint(touchX: Int, touchY: Int): Point {
        val location = IntArray(2)
        getLocationOnScreen(location)
        val touch = Point(touchX, touchY)
        touch.offset(location[0], location[1])
        return touch
    }
}