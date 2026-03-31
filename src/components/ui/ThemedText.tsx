import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Text, TextProps } from "react-native";

interface ThemedTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
  weight?: "regular" | "medium" | "bold";
}

export function ThemedText({
  style,
  variant = "body",
  weight = "regular",
  className,
  ...props
}: ThemedTextProps) {
  const { colors } = useLegalTheme();

  const baseStyles = "text-legal-navy dark:text-legal-ice";

  let variantStyles = "";
  switch (variant) {
    case "h1":
      variantStyles = "text-3xl leading-tight";
      break;
    case "h2":
      variantStyles = "text-2xl leading-snug";
      break;
    case "h3":
      variantStyles = "text-xl leading-snug";
      break;
    case "body":
      variantStyles = "text-base leading-relaxed";
      break;
    case "caption":
      variantStyles =
        "text-sm leading-tight text-legal-slate dark:text-neutral-400";
      break;
    case "label":
      variantStyles =
        "text-xs uppercase tracking-wider text-legal-slate dark:text-neutral-400";
      break;
  }

  let weightStyles = "";
  switch (weight) {
    case "bold":
      weightStyles = "font-bold";
      break;
    case "medium":
      weightStyles = "font-medium";
      break;
    case "regular":
      weightStyles = "font-normal";
      break;
  }

  return (
    <Text
      className={`${baseStyles} ${variantStyles} ${weightStyles} ${className}`}
      style={[style]}
      {...props}
    />
  );
}
