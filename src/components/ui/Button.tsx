import { cn } from "@/lib/utils";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  style?: any;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className,
  textClassName,
  icon,
  style,
}: ButtonProps) {
  const baseStyles = "flex-row items-center justify-center rounded-xl";

  let variantStyles = "";
  let textStyles = "";

  switch (variant) {
    case "primary":
      variantStyles = "bg-legal-navy dark:bg-white";
      textStyles = "text-white dark:text-black font-bold";
      break;
    case "secondary":
      variantStyles = "bg-legal-slate/10 dark:bg-neutral-800";
      textStyles = "text-legal-navy dark:text-white font-medium";
      break;
    case "outline":
      variantStyles =
        "border border-legal-slate/30 dark:border-white/20 bg-transparent";
      textStyles = "text-legal-navy dark:text-white font-medium";
      break;
    case "ghost":
      variantStyles = "bg-transparent";
      textStyles = "text-legal-navy dark:text-legal-ice font-medium";
      break;
  }

  let sizeStyles = "";
  switch (size) {
    case "sm":
      sizeStyles = "px-3 py-2";
      break;
    case "md":
      sizeStyles = "px-4 py-3";
      break;
    case "lg":
      sizeStyles = "px-6 py-4";
      break;
  }

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (disabled || isLoading) return;
    scale.value = withSpring(1, { damping: 18, stiffness: 300 });
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles,
          sizeStyles,
          disabled && "opacity-50",
          className,
        )}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator
            color={
              variant === "primary"
                ? className?.includes("dark:bg-white")
                  ? "black"
                  : "white"
                : "black"
            }
          />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text className={cn("text-base", textStyles, textClassName)}>
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
