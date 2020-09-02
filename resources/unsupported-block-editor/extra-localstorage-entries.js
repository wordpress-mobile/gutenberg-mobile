const storageKey = 'WP_DATA_USER_%@';
const storage = localStorage.getItem(storageKey);

if ( storage ) {
	let parsed = JSON.parse(storage);
	parsed['automattic/nux'] = {
		"isNuxEnabled": false
	};
	const newStorage = JSON.stringify(parsed);
	localStorage.setItem(storageKey, newStorage);

	window.webkit.messageHandlers.log.postMessage( newStorage );
}
// We need to return a string or null, otherwise executing this script will error.
// eslint-disable-next-line no-unused-expressions
( '' );
