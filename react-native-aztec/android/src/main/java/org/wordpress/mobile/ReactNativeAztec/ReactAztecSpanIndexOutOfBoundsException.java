package org.wordpress.mobile.ReactNativeAztec;

public class ReactAztecSpanIndexOutOfBoundsException extends IndexOutOfBoundsException {
    private Exception mOriginalException;
    ReactAztecSpanIndexOutOfBoundsException(Exception indexOutOfBoundsException) {
        super(indexOutOfBoundsException.getMessage());
        mOriginalException = indexOutOfBoundsException;
    }
    public Exception getOriginalException() {
        return mOriginalException;
    }
}
