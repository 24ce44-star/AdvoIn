import { useLegalTheme } from "@/hooks/useLegalTheme";
import { cn } from "@/lib/utils";
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName,
  className,
  ...props
}: InputProps) {
  const { colors, isDark } = useLegalTheme();

  return (
    <View className={cn("w-full mb-4", containerClassName)}>
      {label && (
        <ThemedText
          variant="label"
          className="mb-2 ml-1 text-legal-navy dark:text-legal-ice"
        >
          {label}
        </ThemedText>
      )}
      <TextInput
        placeholderTextColor={props.placeholderTextColor || colors.accent}
        className={cn(
          "w-full px-4 py-3 rounded-xl border",
          "bg-white dark:bg-neutral-900",
          "border-legal-slate/20 dark:border-neutral-800",
          "text-base",
          isDark ? "text-white" : "text-black", // Default text color
          error && "border-legal-crimson",
          className,
        )}
        style={[{ color: isDark ? "white" : "black" }, props.style]} // Ensure explicit color style
        {...props}
      />
      {error && (
        <Text className="text-legal-crimson text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
