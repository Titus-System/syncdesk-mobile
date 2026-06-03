import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

type KeyboardAvoidingViewProps = ViewProps & {
  children: ReactNode;
};

/**
 * Substitui o KeyboardAvoidingView do React Native, que não funciona no Android
 * com edge-to-edge (padrão no Expo SDK 54). Usa o useAnimatedKeyboard do reanimated,
 * que reage corretamente à subida do teclado em ambas as plataformas.
 *
 * O padding animado fica num Animated.View externo e o className (NativeWind)
 * num View interno, evitando depender do NativeWind aplicar estilo em Animated.View.
 */
export function KeyboardAvoidingView({
  children,
  className,
  style,
  ...rest
}: KeyboardAvoidingViewProps) {
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <View {...rest} {...(className ? { className } : {})} style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </Animated.View>
  );
}
