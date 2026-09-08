import React from "react";
import {
  StyleProp,
  Text,
  TextProps,
  TextStyle,
} from "react-native";
import { typography } from "../../constant/typography";

type FontVariant = keyof typeof typography;

type FontTextProps = TextProps & {
  variant?: FontVariant;
  style?: StyleProp<TextStyle>;
};

const FontText = ({
  variant = "body",
  style,
  children,
  ...props
}: FontTextProps) => {
  return (
    <Text
      {...props}
      style={[typography[variant], style]}
    >
      {children}
    </Text>
  );
};

export default FontText;