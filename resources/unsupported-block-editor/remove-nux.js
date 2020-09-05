if ( window.wp.data !== undefined ) {
	const nuxStore = window.wp.data.dispatch( 'automattic/nux' );
	if ( nuxStore ) {
		nuxStore.setWpcomNuxStatus( { isNuxEnabled: false } );
	}

    var elements = document.getElementsByClassName("components-modal__screen-overlay");
    if (elements) {
        elements[0].style.visibility = "hidden";
    }
}

// We need to return a string or null, otherwise executing this script will error.
// eslint-disable-next-line no-unused-expressions
( '' );
