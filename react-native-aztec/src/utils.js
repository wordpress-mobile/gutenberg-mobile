import { Platform } from 'react-native';

export function getScaledFontSize( fontSize, fontScale ) {
	if ( Platform.OS == 'ios' ) {
		return fontSize ? fontSize : undefined; // to not to affect to iOS
	}
	const baseFontSize = 18;
	return ( fontSize ? fontSize : baseFontSize ) * fontScale;
}
