

import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { ANIMATION } from "./colors";

export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export const SMOOTH_SPRING = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

export const QUICK_SPRING = {
  damping: 25,
  stiffness: 300,
  mass: 0.5,
};

/**
 * Fade in animation hook
 * @param delay - Delay before animation starts (ms)
 * @param duration - Animation duration (ms)
 */
export const useFadeIn = (delay = 0, duration = ANIMATION.normal) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.ease),
      }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};

/**
 * Slide up with fade animation hook
 * @param delay - Delay before animation starts (ms)
 * @param distance - Distance to slide from (px)
 */
export const useSlideUp = (delay = 0, distance = 20) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, SMOOTH_SPRING));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [distance, 0]),
      },
    ],
  }));

  return animatedStyle;
};

/**
 * Slide in from right animation hook
 * @param delay - Delay before animation starts (ms)
 */
export const useSlideInRight = (delay = 0) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, SMOOTH_SPRING));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [50, 0]),
      },
    ],
  }));

  return animatedStyle;
};


export const useScalePress = (scaleDown = 0.95) => {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(scaleDown, QUICK_SPRING);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, QUICK_SPRING);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, animatedStyle };
};

/**
 * Stagger animation for list items
 * @param index - Item index in list
 * @param baseDelay - Base delay (ms)
 * @param staggerDelay - Delay between each item (ms)
 */
export const useStaggeredFadeIn = (
  index: number,
  baseDelay = 0,
  staggerDelay = 50,
) => {
  const delay = baseDelay + index * staggerDelay;
  return useSlideUp(delay);
};


export const usePulse = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      opacity.value = withTiming(1, { duration: 800 }, () => {
        opacity.value = withTiming(0.3, { duration: 800 }, () => {
          runOnJS(animate)();
        });
      });
    };
    animate();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
};

/**
 * Progress bar animation
 * @param targetValue - Target progress (0-100)
 */
export const useProgressAnimation = (targetValue: number) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(targetValue, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return animatedStyle;
};

/**
 * Count animation for numbers
 * @param targetValue - Target number
 * @param duration - Animation duration (ms)
 */
export const useCountAnimation = (
  targetValue: number,
  duration = 800,
): Animated.SharedValue<number> => {
  const count = useSharedValue(0);

  useEffect(() => {
    count.value = withTiming(targetValue, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetValue]);

  return count;
};

export default {
  SPRING_CONFIG,
  SMOOTH_SPRING,
  QUICK_SPRING,
  useFadeIn,
  useSlideUp,
  useSlideInRight,
  useScalePress,
  useStaggeredFadeIn,
  usePulse,
  useProgressAnimation,
  useCountAnimation,
};
