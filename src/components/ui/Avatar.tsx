import { cn } from "@/lib/utils";
import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface AvatarProps {
  source?: ImageSourcePropType | string;
  size?: "sm" | "md" | "lg" | "xl";
  initials?: string;
  className?: string;
  online?: boolean;
}

export function Avatar({
  source,
  size = "md",
  initials = "LB",
  className,
  online,
}: AvatarProps) {
  let sizeStyles = "";
  let textVariant: "caption" | "body" | "h3" | "h1" = "body";

  switch (size) {
    case "sm":
      sizeStyles = "w-8 h-8";
      textVariant = "caption";
      break;
    case "md":
      sizeStyles = "w-12 h-12";
      textVariant = "body";
      break;
    case "lg":
      sizeStyles = "w-16 h-16";
      textVariant = "h3";
      break;
    case "xl":
      sizeStyles = "w-24 h-24";
      textVariant = "h1";
      break;
  }
  let dotSize = "";
  let dotOffset = "";
  switch (size) {
    case "sm":
      dotSize = "w-2.5 h-2.5";
      dotOffset = "bottom-0 right-0";
      break;
    case "md":
      dotSize = "w-3.5 h-3.5";
      dotOffset = "bottom-0 right-0.5";
      break;
    case "lg":
      dotSize = "w-4 h-4";
      dotOffset = "bottom-0.5 right-1";
      break;
    case "xl":
      dotSize = "w-5 h-5";
      dotOffset = "bottom-1.5 right-2";
      break;
  }

  const imageSource = typeof source === "string" ? { uri: source } : source;

  return (
    <View className="relative">
      <View
        className={cn(
          "rounded-full overflow-hidden bg-legal-navy/10 dark:bg-legal-ice/10 items-center justify-center border border-black/5 dark:border-white/10 shadow-sm",
          sizeStyles,
          className,
        )}
      >
        {source ? (
          <Image
            source={imageSource}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <ThemedText
            variant={textVariant}
            className="text-legal-navy dark:text-legal-ice font-bold"
          >
            {initials}
          </ThemedText>
        )}
      </View>
      {online && (
        <View
          className={cn(
            "absolute rounded-full bg-legal-emerald border-2 border-white dark:border-[#171717] z-10",
            dotSize,
            dotOffset,
          )}
        />
      )}
    </View>
  );
}
