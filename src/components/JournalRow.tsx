import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { borderRadius, colors, spacing, typography } from "../theme";
import CategoryBadge from "./CategoryBadge";

type JournalTransactionStatus = "PENDING" | "VERIFIED" | "FAILED";

export interface JournaledTransaction {
  txHash: string;
  category: string;
  status: JournalTransactionStatus;
  amount?: string;
  isIncoming: boolean;
  date?: string;
  note?: string;
  description?: string;
}

const CATEGORY_ICON: Record<
  string,
  { bg: string; text: string; icon: string }
> = {
  DEFI: { bg: "#1E3A5F", text: "#60A5FA", icon: "⇄" },
  PERSONAL: { bg: "#1A2E1A", text: "#4ADE80", icon: "👤" },
  TRANSFER: { bg: "#2D1B4E", text: "#A78BFA", icon: "↗" },
  NFT: { bg: "#3D1F00", text: "#FB923C", icon: "◈" },
  BUSINESS: { bg: "#1F2937", text: "#9CA3AF", icon: "💼" },
  FREELANCE: { bg: "#14532D", text: "#34D399", icon: "⬡" },
  "BUSINESS DINING": { bg: "#1F2937", text: "#9CA3AF", icon: "🍽" },
  "SOFTWARE SAAS": { bg: "#1E3A5F", text: "#60A5FA", icon: "☁" },
  REVENUE: { bg: "#14532D", text: "#4ADE80", icon: "↓" },
  HARDWARE: { bg: "#3D1F00", text: "#FB923C", icon: "🛒" },
};

const DEFAULT_ICON = { bg: "#1F2937", text: "#9CA3AF", icon: "•" };

type Props = {
  transaction: JournaledTransaction;
  onPress: () => void;
};

export function JournalRow({ transaction, onPress }: Props) {
  const key = transaction.category.toUpperCase();
  const iconStyle = CATEGORY_ICON[key] ?? DEFAULT_ICON;
  const displayText = transaction.note ?? transaction.description ?? "";

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Category icon */}
      <View style={[styles.iconBox, { backgroundColor: iconStyle.bg }]}>
        <Text style={[styles.iconText, { color: iconStyle.text }]}>
          {iconStyle.icon}
        </Text>
      </View>

      {/* Center */}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {displayText}
        </Text>
        <View style={styles.badgeRow}>
          <CategoryBadge category={transaction.category} size="sm" />
          {transaction.status === "VERIFIED" && (
            <View style={styles.verifiedDot} />
          )}
        </View>
      </View>

      {/* Right */}
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            transaction.isIncoming ? styles.amountIn : styles.amountOut,
          ]}
        >
          {transaction.amount}
        </Text>
        <Text
          style={[
            styles.status,
            transaction.status === "VERIFIED"
              ? styles.statusVerified
              : styles.statusPending,
          ]}
        >
          {transaction.status === "VERIFIED" ? "✓ VERIFIED" : "PENDING"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  iconText: {
    fontSize: typography.md,
  },
  center: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    fontWeight: "500",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  notarizedIcon: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  right: {
    alignItems: "flex-end",
    gap: spacing.xs,
    flexShrink: 0,
    minWidth: 90,
  },
  amount: {
    fontSize: typography.sm,
    fontWeight: "700",
  },
  amountIn: {
    color: colors.success,
  },
  amountOut: {
    color: colors.textPrimary,
  },
  status: {
    fontSize: typography.xs,
    fontWeight: "600",
  },
  statusVerified: {
    color: colors.success,
  },
  statusPending: {
    color: colors.textMuted,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
});
