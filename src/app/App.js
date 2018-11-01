/** @flow
 * @format */

import '../globals';

// Gutenberg imports
import { registerCoreBlocks } from '@wordpress/block-library';
import {
	registerBlockType,
	setUnregisteredTypeHandlerName,
} from '@wordpress/blocks';

import Editor from '../components/editor';

import * as UnsupportedBlock from '../block-types/unsupported-block/';

registerCoreBlocks();
registerBlockType( UnsupportedBlock.name, UnsupportedBlock.settings );
setUnregisteredTypeHandlerName( UnsupportedBlock.name );

export default Editor;
