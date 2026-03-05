import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacing, typography } from "../theme";

type Props = {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  externalLink?: boolean;
  valueColor?: string;
};

export default function MetaRow({
  icon,
  label,
  value,
  onPress,
  externalLink = false,
  valueColor,
}: Props) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Left: icon + label */}
      <View style={styles.left}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Right: value + optional external link indicator */}
      <View style={styles.right}>
        <Text style={[styles.value, valueColor ? { color: valueColor } : {}]}>
          {value}
        </Text>
        {externalLink && <Text style={styles.externalIcon}>↗</Text>}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  value: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  externalIcon: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
});
