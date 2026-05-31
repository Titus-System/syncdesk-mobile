import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import syncdeskLogo from '@/assets/images/syncdesk.png';

type AppOpeningAnimationProps = {
  onFinish: () => void;
};

export function AppOpeningAnimation({ onFinish }: AppOpeningAnimationProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.86)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const finishedRef = useRef(false);

  useEffect(() => {
    function finishOnce() {
      if (finishedRef.current) return;

      finishedRef.current = true;
      onFinish();
    }

    const fallbackTimeout = setTimeout(() => {
      finishOnce();
    }, 3000);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(700),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]);

    animation.start(() => {
      clearTimeout(fallbackTimeout);
      finishOnce();
    });

    return () => {
      clearTimeout(fallbackTimeout);
      animation.stop();
    };
  }, [opacity, scale, translateY, onFinish]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        <Image source={syncdeskLogo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>SyncDesk</Text>
        <Text style={styles.subtitle}>Atendimento inteligente e conectado</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2B0000',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#F3CFCF',
  },
});
