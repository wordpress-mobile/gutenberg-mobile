
/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * @generated by codegen project: GeneratePropsCpp.js
 */

#include <react/renderer/components/FBReactNativeSpec/Props.h>
#include <react/renderer/components/image/conversions.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/propsConversions.h>

namespace facebook {
namespace react {

ActivityIndicatorViewProps::ActivityIndicatorViewProps(
    const PropsParserContext &context,
    const ActivityIndicatorViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    hidesWhenStopped(convertRawProp(context, rawProps, "hidesWhenStopped", sourceProps.hidesWhenStopped, {false})),
    animating(convertRawProp(context, rawProps, "animating", sourceProps.animating, {false})),
    color(convertRawProp(context, rawProps, "color", sourceProps.color, {})),
    size(convertRawProp(context, rawProps, "size", sourceProps.size, {ActivityIndicatorViewSize::Small}))
      {}
DatePickerProps::DatePickerProps(
    const PropsParserContext &context,
    const DatePickerProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    date(convertRawProp(context, rawProps, "date", sourceProps.date, {0.0})),
    initialDate(convertRawProp(context, rawProps, "initialDate", sourceProps.initialDate, {0.0})),
    locale(convertRawProp(context, rawProps, "locale", sourceProps.locale, {})),
    maximumDate(convertRawProp(context, rawProps, "maximumDate", sourceProps.maximumDate, {0.0})),
    minimumDate(convertRawProp(context, rawProps, "minimumDate", sourceProps.minimumDate, {0.0})),
    minuteInterval(convertRawProp(context, rawProps, "minuteInterval", sourceProps.minuteInterval, {DatePickerMinuteInterval::MinuteInterval1})),
    mode(convertRawProp(context, rawProps, "mode", sourceProps.mode, {DatePickerMode::Date})),
    timeZoneOffsetInMinutes(convertRawProp(context, rawProps, "timeZoneOffsetInMinutes", sourceProps.timeZoneOffsetInMinutes, {0.0})),
    pickerStyle(convertRawProp(context, rawProps, "pickerStyle", sourceProps.pickerStyle, {DatePickerPickerStyle::Spinner}))
      {}
AndroidDrawerLayoutProps::AndroidDrawerLayoutProps(
    const PropsParserContext &context,
    const AndroidDrawerLayoutProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    keyboardDismissMode(convertRawProp(context, rawProps, "keyboardDismissMode", sourceProps.keyboardDismissMode, {AndroidDrawerLayoutKeyboardDismissMode::None})),
    drawerBackgroundColor(convertRawProp(context, rawProps, "drawerBackgroundColor", sourceProps.drawerBackgroundColor, {})),
    drawerPosition(convertRawProp(context, rawProps, "drawerPosition", sourceProps.drawerPosition, {AndroidDrawerLayoutDrawerPosition::Left})),
    drawerWidth(convertRawProp(context, rawProps, "drawerWidth", sourceProps.drawerWidth, {})),
    drawerLockMode(convertRawProp(context, rawProps, "drawerLockMode", sourceProps.drawerLockMode, {AndroidDrawerLayoutDrawerLockMode::Unlocked})),
    statusBarBackgroundColor(convertRawProp(context, rawProps, "statusBarBackgroundColor", sourceProps.statusBarBackgroundColor, {}))
      {}
RCTMaskedViewProps::RCTMaskedViewProps(
    const PropsParserContext &context,
    const RCTMaskedViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps)

    
      {}
AndroidProgressBarProps::AndroidProgressBarProps(
    const PropsParserContext &context,
    const AndroidProgressBarProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    styleAttr(convertRawProp(context, rawProps, "styleAttr", sourceProps.styleAttr, {})),
    typeAttr(convertRawProp(context, rawProps, "typeAttr", sourceProps.typeAttr, {})),
    indeterminate(convertRawProp(context, rawProps, "indeterminate", sourceProps.indeterminate, {false})),
    progress(convertRawProp(context, rawProps, "progress", sourceProps.progress, {0.0})),
    animating(convertRawProp(context, rawProps, "animating", sourceProps.animating, {true})),
    color(convertRawProp(context, rawProps, "color", sourceProps.color, {})),
    testID(convertRawProp(context, rawProps, "testID", sourceProps.testID, {""}))
      {}
RCTProgressViewProps::RCTProgressViewProps(
    const PropsParserContext &context,
    const RCTProgressViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    progressViewStyle(convertRawProp(context, rawProps, "progressViewStyle", sourceProps.progressViewStyle, {RCTProgressViewProgressViewStyle::Default})),
    progress(convertRawProp(context, rawProps, "progress", sourceProps.progress, {0.0})),
    progressTintColor(convertRawProp(context, rawProps, "progressTintColor", sourceProps.progressTintColor, {})),
    trackTintColor(convertRawProp(context, rawProps, "trackTintColor", sourceProps.trackTintColor, {})),
    progressImage(convertRawProp(context, rawProps, "progressImage", sourceProps.progressImage, {})),
    trackImage(convertRawProp(context, rawProps, "trackImage", sourceProps.trackImage, {}))
      {}
AndroidSwipeRefreshLayoutProps::AndroidSwipeRefreshLayoutProps(
    const PropsParserContext &context,
    const AndroidSwipeRefreshLayoutProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    enabled(convertRawProp(context, rawProps, "enabled", sourceProps.enabled, {true})),
    colors(convertRawProp(context, rawProps, "colors", sourceProps.colors, {})),
    progressBackgroundColor(convertRawProp(context, rawProps, "progressBackgroundColor", sourceProps.progressBackgroundColor, {})),
    size(convertRawProp(context, rawProps, "size", sourceProps.size, {AndroidSwipeRefreshLayoutSize::Default})),
    progressViewOffset(convertRawProp(context, rawProps, "progressViewOffset", sourceProps.progressViewOffset, {0.0})),
    refreshing(convertRawProp(context, rawProps, "refreshing", sourceProps.refreshing, {false}))
      {}
PullToRefreshViewProps::PullToRefreshViewProps(
    const PropsParserContext &context,
    const PullToRefreshViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    tintColor(convertRawProp(context, rawProps, "tintColor", sourceProps.tintColor, {})),
    titleColor(convertRawProp(context, rawProps, "titleColor", sourceProps.titleColor, {})),
    title(convertRawProp(context, rawProps, "title", sourceProps.title, {})),
    progressViewOffset(convertRawProp(context, rawProps, "progressViewOffset", sourceProps.progressViewOffset, {0.0})),
    refreshing(convertRawProp(context, rawProps, "refreshing", sourceProps.refreshing, {false}))
      {}
SafeAreaViewProps::SafeAreaViewProps(
    const PropsParserContext &context,
    const SafeAreaViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    emulateUnlessSupported(convertRawProp(context, rawProps, "emulateUnlessSupported", sourceProps.emulateUnlessSupported, {false}))
      {}
AndroidHorizontalScrollContentViewProps::AndroidHorizontalScrollContentViewProps(
    const PropsParserContext &context,
    const AndroidHorizontalScrollContentViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    removeClippedSubviews(convertRawProp(context, rawProps, "removeClippedSubviews", sourceProps.removeClippedSubviews, {false}))
      {}
SliderProps::SliderProps(
    const PropsParserContext &context,
    const SliderProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    disabled(convertRawProp(context, rawProps, "disabled", sourceProps.disabled, {false})),
    enabled(convertRawProp(context, rawProps, "enabled", sourceProps.enabled, {true})),
    maximumTrackImage(convertRawProp(context, rawProps, "maximumTrackImage", sourceProps.maximumTrackImage, {})),
    maximumTrackTintColor(convertRawProp(context, rawProps, "maximumTrackTintColor", sourceProps.maximumTrackTintColor, {})),
    maximumValue(convertRawProp(context, rawProps, "maximumValue", sourceProps.maximumValue, {1.0})),
    minimumTrackImage(convertRawProp(context, rawProps, "minimumTrackImage", sourceProps.minimumTrackImage, {})),
    minimumTrackTintColor(convertRawProp(context, rawProps, "minimumTrackTintColor", sourceProps.minimumTrackTintColor, {})),
    minimumValue(convertRawProp(context, rawProps, "minimumValue", sourceProps.minimumValue, {0.0})),
    step(convertRawProp(context, rawProps, "step", sourceProps.step, {0.0})),
    testID(convertRawProp(context, rawProps, "testID", sourceProps.testID, {""})),
    thumbImage(convertRawProp(context, rawProps, "thumbImage", sourceProps.thumbImage, {})),
    thumbTintColor(convertRawProp(context, rawProps, "thumbTintColor", sourceProps.thumbTintColor, {})),
    trackImage(convertRawProp(context, rawProps, "trackImage", sourceProps.trackImage, {})),
    value(convertRawProp(context, rawProps, "value", sourceProps.value, {0.0}))
      {}
AndroidSwitchProps::AndroidSwitchProps(
    const PropsParserContext &context,
    const AndroidSwitchProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    disabled(convertRawProp(context, rawProps, "disabled", sourceProps.disabled, {false})),
    enabled(convertRawProp(context, rawProps, "enabled", sourceProps.enabled, {true})),
    thumbColor(convertRawProp(context, rawProps, "thumbColor", sourceProps.thumbColor, {})),
    trackColorForFalse(convertRawProp(context, rawProps, "trackColorForFalse", sourceProps.trackColorForFalse, {})),
    trackColorForTrue(convertRawProp(context, rawProps, "trackColorForTrue", sourceProps.trackColorForTrue, {})),
    value(convertRawProp(context, rawProps, "value", sourceProps.value, {false})),
    on(convertRawProp(context, rawProps, "on", sourceProps.on, {false})),
    thumbTintColor(convertRawProp(context, rawProps, "thumbTintColor", sourceProps.thumbTintColor, {})),
    trackTintColor(convertRawProp(context, rawProps, "trackTintColor", sourceProps.trackTintColor, {}))
      {}
SwitchProps::SwitchProps(
    const PropsParserContext &context,
    const SwitchProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    disabled(convertRawProp(context, rawProps, "disabled", sourceProps.disabled, {false})),
    value(convertRawProp(context, rawProps, "value", sourceProps.value, {false})),
    tintColor(convertRawProp(context, rawProps, "tintColor", sourceProps.tintColor, {})),
    onTintColor(convertRawProp(context, rawProps, "onTintColor", sourceProps.onTintColor, {})),
    thumbTintColor(convertRawProp(context, rawProps, "thumbTintColor", sourceProps.thumbTintColor, {})),
    thumbColor(convertRawProp(context, rawProps, "thumbColor", sourceProps.thumbColor, {})),
    trackColorForFalse(convertRawProp(context, rawProps, "trackColorForFalse", sourceProps.trackColorForFalse, {})),
    trackColorForTrue(convertRawProp(context, rawProps, "trackColorForTrue", sourceProps.trackColorForTrue, {}))
      {}
InputAccessoryProps::InputAccessoryProps(
    const PropsParserContext &context,
    const InputAccessoryProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    backgroundColor(convertRawProp(context, rawProps, "backgroundColor", sourceProps.backgroundColor, {}))
      {}
UnimplementedNativeViewProps::UnimplementedNativeViewProps(
    const PropsParserContext &context,
    const UnimplementedNativeViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    name(convertRawProp(context, rawProps, "name", sourceProps.name, {""}))
      {}
ModalHostViewProps::ModalHostViewProps(
    const PropsParserContext &context,
    const ModalHostViewProps &sourceProps,
    const RawProps &rawProps): ViewProps(context, sourceProps, rawProps),

    animationType(convertRawProp(context, rawProps, "animationType", sourceProps.animationType, {ModalHostViewAnimationType::None})),
    presentationStyle(convertRawProp(context, rawProps, "presentationStyle", sourceProps.presentationStyle, {ModalHostViewPresentationStyle::FullScreen})),
    transparent(convertRawProp(context, rawProps, "transparent", sourceProps.transparent, {false})),
    statusBarTranslucent(convertRawProp(context, rawProps, "statusBarTranslucent", sourceProps.statusBarTranslucent, {false})),
    hardwareAccelerated(convertRawProp(context, rawProps, "hardwareAccelerated", sourceProps.hardwareAccelerated, {false})),
    visible(convertRawProp(context, rawProps, "visible", sourceProps.visible, {false})),
    animated(convertRawProp(context, rawProps, "animated", sourceProps.animated, {false})),
    supportedOrientations(convertRawProp(context, rawProps, "supportedOrientations", sourceProps.supportedOrientations, {static_cast<ModalHostViewSupportedOrientationsMask>(ModalHostViewSupportedOrientations::Portrait)})),
    identifier(convertRawProp(context, rawProps, "identifier", sourceProps.identifier, {0}))
      {}

} // namespace react
} // namespace facebook
