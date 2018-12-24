import { Dimensions } from 'react-native';

export const isLandscape = () => {
	const { height: fullHeight, width: fullWidth } = Dimensions.get( 'window' );
	return ( fullWidth > fullHeight );
};
