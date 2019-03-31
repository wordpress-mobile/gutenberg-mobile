import { Platform } from 'react-native';

// Basically React Native has a mechanism to scale font size automatically.
// But GM is rendered on top of fragment of which retain flag is true.
// Hence we deal with fontScale change manually on our side.
export function getScaledFontSize( fontSize, fontScale ) {
	if ( Platform.OS === 'ios' ) {
		return fontSize ? fontSize : undefined; // to not to affect to iOS
	}
	const baseFontSize = 18;
	return ( fontSize ? fontSize : baseFontSize ) * fontScale;
}
