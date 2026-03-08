import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Zap,
  Briefcase,
  User,
  Building2,
  HelpCircle,
  CheckCircle,
  Clock,
} from "lucide-react-native";
import { borderRadius, colors, spacing, typography } from "../theme";
import CategoryBadge from "./CategoryBadge";

export interface JournaledTransaction {
  txHash: string;
  category: string;
  status: "VERIFIED" | "PENDING";
  amount: string;
  isIncoming: boolean;
  date: string;
  note?: string;
  description?: string;
}

interface Props {
  transaction: JournaledTransaction;
  onPress: () => void;
}

interface IconStyle {
  icon: React.ReactNode;
  bg: string;
  text: string;
}

function getCategoryIcon(category: string): IconStyle {
  const size = 16;
  switch (category.toUpperCase()) {
    case "DEFI":
      return {
        icon: <Zap size={size} color="#A78BFA" />,
        bg: "#2D1B4E",
        text: "#A78BFA",
      };
    case "FREELANCE":
      return {
        icon: <Briefcase size={size} color="#34D399" />,
        bg: "#1A3D2E",
        text: "#34D399",
      };
    case "PERSONAL":
      return {
        icon: <User size={size} color="#60A5FA" />,
        bg: "#1E3A5F",
        text: "#60A5FA",
      };
    case "BUSINESS":
      return {
        icon: <Building2 size={size} color="#FBBF24" />,
        bg: "#3D2E00",
        text: "#FBBF24",
      };
    default:
      return {
        icon: <HelpCircle size={size} color="#9CA3AF" />,
        bg: "#1F2937",
        text: "#9CA3AF",
      };
  }
}

export function JournalRow({ transaction, onPress }: Props) {
  const iconStyle = getCategoryIcon(transaction.category);
  const displayText = transaction.note ?? transaction.description ?? "";

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: iconStyle.bg }]}>
        {iconStyle.icon}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {displayText}
        </Text>
        <View style={styles.badgeRow}>
          <CategoryBadge category={transaction.category} size="sm" />
          {transaction.status === "VERIFIED" && (
            <CheckCircle size={12} color={colors.success} />
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            transaction.isIncoming ? styles.amountIn : styles.amountOut,
          ]}
        >
          {transaction.amount}
        </Text>
        <View style={styles.statusRow}>
          {transaction.status === "VERIFIED" ? (
            <CheckCircle size={12} color={colors.success} />
          ) : (
            <Clock size={12} color={colors.textMuted} />
          )}
          <Text
            style={[
              styles.status,
              transaction.status === "VERIFIED"
                ? styles.statusVerified
                : styles.statusPending,
            ]}
          >
            {transaction.status === "VERIFIED" ? "VERIFIED" : "PENDING"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, gap: 4 },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    fontWeight: "600",
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  right: { alignItems: "flex-end", gap: 4 },
  amount: { fontSize: typography.sm, fontWeight: "700" },
  amountIn: { color: colors.success },
  amountOut: { color: colors.textPrimary },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  status: { fontSize: typography.xs, fontWeight: "600" },
  statusVerified: { color: colors.success },
  statusPending: { color: colors.textMuted },
});
