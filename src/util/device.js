import { Dimensions, Platform } from 'react-native';

export const isIpad = ( () => {
	const isIOS = Platform.OS === 'ios';
	if ( ! isIOS ) {
		return false;
	}
	const { height, width } = Dimensions.get( 'window' );
	const iPhoneAspectRatio = 1.6;

	if ( height > width ) {
		return ( height / width ) < iPhoneAspectRatio;
	}
	return ( width / height ) < iPhoneAspectRatio;
} )();
