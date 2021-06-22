// This file is to set up the jetpack/layout-grid block that currently lives in block-experiments/blocks/layout-grid
import { registerBlock } from '../block-experiments/blocks/layout-grid/src';

export default function setupBlockExperiments( capabilities ) {
	if ( capabilities.layoutGridBlock ) {
		registerBlock();
	}
}
