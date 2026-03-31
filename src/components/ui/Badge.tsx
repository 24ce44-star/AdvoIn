import { cn } from "@/lib/utils";
import React from "react";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";

interface BadgeProps {
  text: string;
  variant?: "outline" | "solid" | "accent";
  className?: string;
}

export function Badge({ text, variant = "outline", className }: BadgeProps) {
  let variantStyles = "";
  let textStyles = "";

  switch (variant) {
    case "outline":
      variantStyles = "border border-legal-slate/30 bg-transparent";
      textStyles = "text-legal-slate dark:text-legal-slate";
      break;
    case "solid":
      variantStyles = "bg-legal-navy dark:bg-legal-ice";
      textStyles = "text-legal-ice dark:text-legal-navy";
      break;
    case "accent":
      variantStyles = "bg-legal-navy/10 dark:bg-legal-ice/10";
      textStyles = "text-legal-navy dark:text-legal-ice";
      break;
  }

  return (
    <View
      className={cn(
        "px-2.5 py-1 rounded-full self-start",
        variantStyles,
        className,
      )}
    >
      <ThemedText
        variant="label"
        className={cn("text-[10px] font-bold tracking-widest", textStyles)}
      >
        {text}
      </ThemedText>
    </View>
  );
}
