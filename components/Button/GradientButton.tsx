import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientButtonProps = {
  onPress: (event: GestureResponderEvent) => void;
 label: string | ReactNode;   colors?: [string, string]; // Allow custom colors, fallback provided
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
   style?: StyleProp<ViewStyle>;
};

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  label,
  colors = ['#000000', '#474747'],
  buttonStyle,
  textStyle,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={[styles.button, buttonStyle]}
      >
        <Text style={[styles.buttonText, textStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
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
    fontWeight: 700,
    fontFamily: 'SF Pro',
  },
});

export default GradientButton;
