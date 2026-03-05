import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";

// generate a consistent color from a wallet address
function getAvatarColor(address: string): string {
  const palette = [
    "#7C3AED",
    "#2563EB",
    "#059669",
    "#D97706",
    "#DC2626",
    "#0891B2",
  ];
  const index = address.charCodeAt(0) % palette.length;
  return palette[index];
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

type Props = {
  walletAddress: string;
  onRemove: (walletAddress: string) => void;
};

export default function ViewerRow({ walletAddress, onRemove }: Props) {
  const avatarColor = getAvatarColor(walletAddress);
  const initials = walletAddress.slice(0, 2).toUpperCase();

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: avatarColor + "30", borderColor: avatarColor },
        ]}
      >
        <Text style={[styles.initials, { color: avatarColor }]}>
          {initials}
        </Text>
      </View>

      {/* Address */}
      <Text style={styles.address}>{shortenAddress(walletAddress)}</Text>

      {/* Remove button */}
      <TouchableOpacity
        onPress={() => onRemove(walletAddress)}
        style={styles.removeButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: typography.xs,
    fontWeight: "700",
  },
  address: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: "500",
    fontFamily: "monospace",
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeIcon: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
});
