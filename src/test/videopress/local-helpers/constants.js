export const DEFAULT_PROPS = {
	capabilities: {
		videoPressBlock: true,
	},
};

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

export const ADDITIONAL_PRIVACY_AND_RATING_SETTINGS = [
	'Allow download',
	'Show video sharing menu',
];
