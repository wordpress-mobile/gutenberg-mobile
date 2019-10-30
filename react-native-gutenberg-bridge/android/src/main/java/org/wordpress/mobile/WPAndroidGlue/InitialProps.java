package org.wordpress.mobile.WPAndroidGlue;

import android.os.Bundle;
import android.os.Parcel;
import android.os.Parcelable;

import java.util.Map;

public class InitialProps implements Parcelable {

    static final String PROP_NAME_INITIAL_DATA = "initialData";
    static final String PROP_NAME_INITIAL_TITLE = "initialTitle";
    private static final String PROP_NAME_INITIAL_HTML_MODE_ENABLED = "initialHtmlModeEnabled";
    private static final String PROP_NAME_LOCALE = "locale";
    private static final String PROP_NAME_TRANSLATIONS = "translations";
    private static final String PROP_NAME_SITE_SLUG = "siteSlug";
    private static final String PROP_NAME_EXTRA_HTTP_HEADERS = "extraHTTPHeaders";

    private String data = "";
    private String title = "";
    private Boolean isHtmlModeEnabled;
    private String locale;
    private Bundle translations;
    private String siteSlug;
    private Map<String, String> extraHttpHeaders;

    public InitialProps() {}

    public Bundle toBundle(Bundle previousProps) {

        if (previousProps == null) previousProps = new Bundle();

        previousProps.putString(PROP_NAME_INITIAL_DATA, data);
        previousProps.putString(PROP_NAME_INITIAL_TITLE, title);

        if (isHtmlModeEnabled != null) {
            previousProps.putBoolean(PROP_NAME_INITIAL_HTML_MODE_ENABLED, isHtmlModeEnabled);
        }
        if (locale != null) {
            previousProps.putString(PROP_NAME_LOCALE, locale);
        }
        if (translations != null) {
            previousProps.putBundle(PROP_NAME_TRANSLATIONS, translations);
        }
        if (siteSlug != null) {
            previousProps.putString(PROP_NAME_SITE_SLUG, siteSlug);
        }

        Bundle headersBundle = extraHttpHeadersBundle();
        if (headersBundle != null) {
            previousProps.putBundle(PROP_NAME_EXTRA_HTTP_HEADERS, headersBundle);
        }

        return previousProps;
    }

    private Bundle extraHttpHeadersBundle() {
        if (extraHttpHeaders == null) {
            return null;
        } else {
            Bundle bundle = new Bundle();

            for (Map.Entry<String, String> entry : extraHttpHeaders.entrySet()) {
                bundle.putString(entry.getKey(), entry.getValue());
            }
            return bundle;
        }
    }

    public void setData(String data) {
        this.data = data;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setHtmlModeEnabled(Boolean htmlModeEnabled) {
        isHtmlModeEnabled = htmlModeEnabled;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public void setTranslations(Bundle translations) {
        this.translations = translations;
    }

    public void setSiteSlug(String siteSlug) {
        this.siteSlug = siteSlug;
    }

    public void setExtraHttpHeaders(Map<String, String> extraHttpHeaders) {
        this.extraHttpHeaders = extraHttpHeaders;
    }

    // Parcelable Implementation

    protected InitialProps(Parcel in) {
        data = in.readString();
        title = in.readString();
        byte tmpIsHtmlModeEnabled = in.readByte();
        isHtmlModeEnabled = tmpIsHtmlModeEnabled == 0 ? null : tmpIsHtmlModeEnabled == 1;
        locale = in.readString();
        translations = in.readBundle();
        siteSlug = in.readString();
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(data);
        dest.writeString(title);
        dest.writeByte((byte) (isHtmlModeEnabled == null ? 0 : isHtmlModeEnabled ? 1 : 2));
        dest.writeString(locale);
        dest.writeBundle(translations);
        dest.writeString(siteSlug);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final Creator<InitialProps> CREATOR = new Creator<InitialProps>() {
        @Override
        public InitialProps createFromParcel(Parcel in) {
            return new InitialProps(in);
        }

        @Override
        public InitialProps[] newArray(int size) {
            return new InitialProps[size];
        }
    };
}

