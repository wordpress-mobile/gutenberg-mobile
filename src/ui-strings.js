//  import { addString } from '@wordpress/components';


export const uiStrings = ( props ) => {
    const unsupportedBlocksExplanation = props.capabilities.isUnsupportedBlocksEnabled
? //__(
        "FROM GB MOBILE: We are working hard to add more blocks with each release. In the meantime, you can also edit this block using your device's web browser."
  //)
: //__(
        'FROM GB MOBILE We are working hard to add more blocks with each release. In the meantime, you can also edit this post on the web.'
;  //);

    return {
        'missing-block-detail': unsupportedBlocksExplanation,
    }
}
