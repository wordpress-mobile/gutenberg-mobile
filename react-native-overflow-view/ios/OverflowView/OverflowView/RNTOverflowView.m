//
//  RNTOverflowView.m
//  OverflowView
//
//  Created by Chip Snyder on 3/17/20.
//  Copyright © 2020 Automattic. All rights reserved.
//

#import "RNTOverflowView.h"

@implementation RNTOverflowView

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {

    CGPoint normalizedPoint = [self convertPoint:point toView:nil];
    UIView *successfulHit = [self checkHitTest:normalizedPoint withEvent:event inView:self];

    if(successfulHit) {
        return successfulHit;
    }

    return [super hitTest:point withEvent:event];
}

- (UIView *)checkHitTest:(CGPoint)point withEvent:(UIEvent *)event inView:(UIView *)parent {

    for (UIView *subview in [parent.subviews.reverseObjectEnumerator allObjects]) {

        CGRect adjsutedFrame = subview.frame;
        adjsutedFrame.origin = [parent convertPoint:subview.frame.origin toView:nil];
        
        UIView *targetView = [self checkHitTest:point withEvent:event inView:subview];
        
        if (targetView) {
            return targetView;
        }
        else if (CGRectContainsPoint(adjsutedFrame, point)) {
            return subview;
        }
    }

    return nil;
}

@end
