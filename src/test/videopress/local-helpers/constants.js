export const DEFAULT_PROPS = {
	capabilities: {
		videoPressBlock: true,
	},
};

export const VIDEOPRESS_EMPTY_BLOCK_HTML = '<!-- wp:videopress/video /-->';
export const VIDEOPRESS_BLOCK_HTML = `<!-- wp:videopress/video {"title":"default-title-is-file-name","description":"","useAverageColor":false,"id":1,"guid":"AbCdEfGh","privacySetting":2,"allowDownload":false,"rating":"G","isPrivate":true,"duration":2803} /-->`;

export const PLAYBACK_SETTINGS = [
	'Autoplay',
	'Loop',
	'Muted',
	'Show Controls',
	'Play Inline',
	'Preload Metadata',
];

export const PLAYBACK_BAR_COLOR_SETTINGS = [
	{ setting: 'Dynamic color' },
	{ setting: 'Main', color: 'Luminous vivid amber' },
	{ setting: 'Loaded', color: 'Light green cyan' },
	{ setting: 'Progress', color: 'Vivid purple' },
];

export const RATING_OPTIONS = [ 'G', 'PG-13', 'R' ];

export const PRIVACY_OPTIONS = [ 'Site default (Public)', 'Public', 'Private' ];

export const ADDITIONAL_PRIVACY_AND_RATING_SETTINGS = [
	'Allow download',
	'Show video sharing menu',
];

export const MEDIA_OPTIONS = [
	'Choose from device',
	'Take a Video',
	'WordPress Media Library',
	'Insert from URL',
];

export const VIDEOPRESS_GUID = 'AbCdEfGh';
