import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";

// each category has its own background and text color
const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  DEFI: { bg: "#1E3A5F", text: "#60A5FA" },
  PERSONAL: { bg: "#1A2E1A", text: "#4ADE80" },
  TRANSFER: { bg: "#2D1B4E", text: "#A78BFA" },
  NFT: { bg: "#3D1F00", text: "#FB923C" },
  BUSINESS: { bg: "#1F2937", text: "#9CA3AF" },
  FREELANCE: { bg: "#1A2E1A", text: "#34D399" },
  "BUSINESS DINING": { bg: "#1F2937", text: "#9CA3AF" },
  "SOFTWARE SAAS": { bg: "#1E3A5F", text: "#60A5FA" },
  REVENUE: { bg: "#14532D", text: "#4ADE80" },
  HARDWARE: { bg: "#3D1F00", text: "#FB923C" },
};

const DEFAULT_STYLE = { bg: "#1F2937", text: "#9CA3AF" };

type Props = {
  category: string;
  // optional: smaller variant for compact cards
  size?: "sm" | "md";
};

export default function CategoryBadge({ category, size = "md" }: Props) {
  const style = CATEGORY_STYLES[category.toUpperCase()] ?? DEFAULT_STYLE;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.bg },
        size === "sm" && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: style.text },
          size === "sm" && styles.textSm,
        ]}
      >
        {category.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
});
