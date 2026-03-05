import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";
import CategoryBadge from "./CategoryBadge";

export type TransactionType =
  | "SWAP"
  | "TRANSFER"
  | "NFT_MINT"
  | "NFT_SALE"
  | "STAKE"
  | "UNKNOWN";

export interface Transaction {
  txHash: string;
  type: TransactionType;
  description: string;
  amount: string;
  amountUsd: string;
  isIncoming: boolean;
  date: string;
  category?: string;
  note?: string;
  nftImageUrl?: string;
  counterparty?: string;
}

// map transaction type to an emoji icon
const TYPE_ICON: Record<TransactionType, string> = {
  SWAP: "⇄",
  TRANSFER: "↗",
  NFT_MINT: "◈",
  NFT_SALE: "◈",
  STAKE: "⬡",
  UNKNOWN: "•",
};

const TYPE_ICON_BG: Record<TransactionType, string> = {
  SWAP: "#2D1B4E",
  TRANSFER: "#1A2E1A",
  NFT_MINT: "#3D1F00",
  NFT_SALE: "#3D1F00",
  STAKE: "#1E3A5F",
  UNKNOWN: "#1F2937",
};

type Props = {
  transaction: Transaction;
  onPress: (txHash: string) => void;
};

export default function TransactionCard({ transaction, onPress }: Props) {
  const {
    txHash,
    type,
    description,
    amountUsd,
    isIncoming,
    date,
    category,
    note,
    nftImageUrl,
  } = transaction;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(txHash)}
      activeOpacity={0.75}
    >
      <View style={styles.row}>
        {/* Type icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: TYPE_ICON_BG[type] },
          ]}
        >
          <Text style={styles.icon}>{TYPE_ICON[type]}</Text>
        </View>

        {/* Center content */}
        <View style={styles.center}>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.date}>{date}</Text>
            {category && (
              <>
                <Text style={styles.dot}>•</Text>
                <CategoryBadge category={category} size="sm" />
              </>
            )}
          </View>
          {/* Note preview */}
          {note ? (
            <View style={styles.noteRow}>
              <Text style={styles.noteIcon}>≡</Text>
              <Text style={styles.noteText} numberOfLines={1}>
                "{note}"
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => onPress(txHash)}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <View style={styles.noteRow}>
                <Text style={styles.noteIcon}>≡</Text>
                <Text style={styles.addNoteText}>Add note...</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Amount */}
        <Text
          style={[
            styles.amount,
            isIncoming ? styles.amountIncoming : styles.amountOutgoing,
          ]}
        >
          {isIncoming ? "+" : ""}
          {amountUsd}
        </Text>
      </View>

      {/* NFT thumbnail */}
      {nftImageUrl && (
        <Image
          source={{ uri: nftImageUrl }}
          style={styles.nftImage}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  icon: {
    fontSize: typography.lg,
    color: colors.textPrimary,
  },
  center: {
    flex: 1,
    gap: spacing.xs,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: "500",
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  date: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  dot: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  noteIcon: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  noteText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontStyle: "italic",
    flex: 1,
  },
  addNoteText: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  amount: {
    fontSize: typography.md,
    fontWeight: "700",
    flexShrink: 0,
  },
  amountIncoming: {
    color: colors.success,
  },
  amountOutgoing: {
    color: colors.textPrimary,
  },
  nftImage: {
    width: 120,
    height: 100,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
});
