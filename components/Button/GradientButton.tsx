// components/Button/GradientButton.tsx
import React, { ReactNode } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientButtonProps = {
  onPress: (event: GestureResponderEvent) => void;
  label: string | ReactNode;
  colors?: [string, string];
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  label,
  colors = ['#000000', '#474747'],
  buttonStyle,
  textStyle,
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: pressed ? 0.8 : 1 },
        buttonStyle,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#b3b3b3', '#b3b3b3'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, buttonStyle]}
      >
        {typeof label === 'string' ? (
          <Text style={[styles.buttonText, textStyle]}>
            {label}
          </Text>
        ) : (
          label
        )}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 350,
    height: 55,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'SF Pro',
  },
});

export default GradientButton;
