package com.gutenberg;

import android.os.CountDownTimer;
import android.util.Log;

import com.facebook.react.bridge.ReadableArray;

import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent;
import org.wordpress.mobile.WPAndroidGlue.Media;

import java.util.Arrays;
import java.util.List;

/**
 * Created by Matthew Kevins on 11/4/19.
 */
public class FakeBridgeJS2Parent implements GutenbergBridgeJS2Parent {
    private static final String TAG = "MainApplication";

    private static final String IMAGE_URL_MOUNTAIN = "https://cldup.com/cXyG__fTLN.jpg";
    private static final String IMAGE_URL_WATERLILIES = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Claude_Monet_-_Waterlilies_-_Google_Art_Project_%28hgEnPzjBK2STHg%29.jpg/810px-Claude_Monet_-_Waterlilies_-_Google_Art_Project_%28hgEnPzjBK2STHg%29.jpg";
    private static final String IMAGE_URL_CARTWHEEL = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/M101_hires_STScI-PRC2006-10a.jpg/767px-M101_hires_STScI-PRC2006-10a.jpg";
    private static final String IMAGE_URL_PUMPKIN = "https://upload.wikimedia.org/wikipedia/commons/4/48/US_Army_52698_Fall_fun_ripe_for_the_picking.jpg";

    private void startFakeUpload(RNMedia media, MediaUploadCallback mediaUploadCallback,
                                 long duration, long progressInterval, int localId) {
        new CountDownTimer(duration, progressInterval) {
            @Override
            public void onTick(long millisUntilFinished) {
                float progress = 1f - (float) millisUntilFinished / duration;
                mediaUploadCallback.onMediaFileUploadProgress(localId, progress);
            }

            @Override
            public void onFinish() {
//                        mediaUploadCallback.onMediaFileUploadSucceeded(localId, media.getUrl(), media.getId());
                mediaUploadCallback.onMediaFileUploadFailed(localId);
            }
        }.start();
    }

    @Override
    public void responseHtml(String title, String html, boolean changed) {

    }

    @Override
    public void editorDidMount(ReadableArray unsupportedBlockNames) {

    }

    @Override
    public void requestMediaPickFromMediaLibrary(MediaUploadCallback mediaUploadCallback, Boolean allowMultipleSelection, MediaType mediaType) {
        List<RNMedia> mediaList;

        if (allowMultipleSelection) {
            mediaList = Arrays.asList(
                    new Media(101, IMAGE_URL_MOUNTAIN, "image"),
                    new Media(42, IMAGE_URL_WATERLILIES, "image")
            );
        } else {
            mediaList = Arrays.asList(
                    new Media(101, IMAGE_URL_MOUNTAIN, "image")
            );
        }

        mediaUploadCallback.onUploadMediaFileSelected(mediaList);
    }

    @Override
    public void requestMediaPickFromDeviceLibrary(MediaUploadCallback mediaUploadCallback, Boolean allowMultipleSelection, MediaType mediaType) {
        List<RNMedia> mediaList;
        long fakeUploadDuration1 = 3 * 1000;
        long fakeUploadDuration2 = 7 * 1000;
        long fakeProgressInterval = 1000;

        if (allowMultipleSelection) {
            mediaList = Arrays.asList(
                    new Media(43, IMAGE_URL_PUMPKIN, "image"),
                    new Media(44, IMAGE_URL_CARTWHEEL, "image")
            );

            startFakeUpload(mediaList.get(0), mediaUploadCallback, fakeUploadDuration1, fakeProgressInterval, 43);
            startFakeUpload(mediaList.get(1), mediaUploadCallback, fakeUploadDuration2, fakeProgressInterval, 44);

        } else {
            mediaList = Arrays.asList(
                    new Media(43, IMAGE_URL_PUMPKIN, "image")
            );

            startFakeUpload(mediaList.get(0), mediaUploadCallback, fakeUploadDuration1, fakeProgressInterval, 43);
        }

        mediaUploadCallback.onUploadMediaFileSelected(mediaList);
    }

    @Override
    public void requestMediaPickerFromDeviceCamera(MediaUploadCallback mediaUploadCallback, MediaType mediaType) {

    }

    @Override
    public void requestMediaImport(String url, MediaUploadCallback mediaUploadCallback) {

    }

    @Override
    public void mediaUploadSync(MediaUploadCallback mediaUploadCallback) {

    }

    @Override
    public void requestImageFailedRetryDialog(int mediaId) {

    }

    @Override
    public void requestImageUploadCancelDialog(int mediaId) {

    }

    @Override
    public void requestImageUploadCancel(int mediaId) {

    }

    @Override
    public void editorDidEmitLog(String message, LogLevel logLevel) {
        switch (logLevel) {
            case TRACE:
                Log.d(TAG, message);
                break;
            case INFO:
                Log.i(TAG, message);
                break;
            case WARN:
                Log.w(TAG, message);
                break;
            case ERROR:
                Log.e(TAG, message);
                break;
        }

    }

    @Override
    public void editorDidAutosave() {

    }

    @Override
    public void getOtherMediaPickerOptions(OtherMediaOptionsReceivedCallback otherMediaOptionsReceivedCallback, MediaType mediaType) {

    }

    @Override
    public void requestMediaPickFrom(String mediaSource, MediaUploadCallback mediaUploadCallback, Boolean allowMultipleSelection) {

    }

    @Override
    public void requestImageFullscreenPreview(String mediaUrl) {

    }
}
