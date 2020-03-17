//
//  RNTOverflowViewManager.m
//  RNTKeyboardAwareScrollView
//
//  Created by Pınar Olguç on 7.10.2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "RNTOverflowViewManager.h"
#import "RNTOverflowView.h"

@implementation RNTOverflowViewManager

RCT_EXPORT_MODULE(RNTOverflowView)

- (UIView *)view {
    return [[RNTOverflowView alloc] init];
}

@end
