package com.gutenberg;

import android.app.Application;
import android.util.Log;

import androidx.core.util.Consumer;

import com.facebook.react.ReactApplication;
import com.brentvatne.react.ReactVideoPackage;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.devsupport.interfaces.DevOptionHandler;
import com.facebook.react.devsupport.interfaces.DevSupportManager;
import com.horcrux.svg.SvgPackage;

import org.wordpress.mobile.ReactNativeAztec.ReactAztecPackage;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent;
import org.wordpress.mobile.ReactNativeGutenbergBridge.RNReactNativeGutenbergBridgePackage;

import com.github.godness84.RNRecyclerViewList.RNRecyclerviewListPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private static final String TAG = "MainApplication";

    private ReactNativeHost mReactNativeHost;
    private RNReactNativeGutenbergBridgePackage mRnReactNativeGutenbergBridgePackage;

    private ReactNativeHost createReactNativeHost() {
        mRnReactNativeGutenbergBridgePackage = new RNReactNativeGutenbergBridgePackage(new FakeBridgeJS2Parent());

        return new ReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
                return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
                return Arrays.asList(
                        new MainReactPackage(),
                        new ReactVideoPackage(),
                        new SvgPackage(),
                        new ReactAztecPackage(),
                        new RNRecyclerviewListPackage(),
                        mRnReactNativeGutenbergBridgePackage);
            }

            @Override
            protected String getJSMainModuleName() {
                return "index";
            }
        };
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        if (mReactNativeHost == null) {
            mReactNativeHost = createReactNativeHost();
            createCustomDevOptions(mReactNativeHost);
        }

        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }

    private void createCustomDevOptions(ReactNativeHost reactNativeHost) {
        DevSupportManager devSupportManager = reactNativeHost.getReactInstanceManager().getDevSupportManager();

        devSupportManager.addCustomDevOption("Show html", new DevOptionHandler() {
            @Override
            public void onOptionSelected() {
                mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().toggleEditorMode();
            }
        });
    }
}
