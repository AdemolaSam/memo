import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ImageIcon,
  Layers,
  CircleDot,
  AlignLeft,
} from "lucide-react-native";
import { borderRadius, colors, spacing, typography } from "../theme";
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

const TYPE_ICON_BG: Record<TransactionType, string> = {
  SWAP: "#2D1B4E",
  TRANSFER: "#1A2E1A",
  NFT_MINT: "#3D1F00",
  NFT_SALE: "#3D1F00",
  STAKE: "#1E3A5F",
  UNKNOWN: "#1F2937",
};

function TypeIcon({
  type,
  isIncoming,
}: {
  type: TransactionType;
  isIncoming: boolean;
}) {
  const size = 18;
  const color = colors.textPrimary;
  switch (type) {
    case "SWAP":
      return <RefreshCw size={size} color={color} />;
    case "TRANSFER":
      return isIncoming ? (
        <ArrowDownLeft size={size} color={colors.success} />
      ) : (
        <ArrowUpRight size={size} color={color} />
      );
    case "NFT_MINT":
    case "NFT_SALE":
      return <ImageIcon size={size} color={color} />;
    case "STAKE":
      return <Layers size={size} color={color} />;
    default:
      return <CircleDot size={size} color={color} />;
  }
}

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
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: TYPE_ICON_BG[type] },
          ]}
        >
          <TypeIcon type={type} isIncoming={isIncoming} />
        </View>

        <View style={styles.center}>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.date}>{date}</Text>
            {category && (
              <>
                <Text style={styles.dot}>·</Text>
                <CategoryBadge category={category} size="sm" />
              </>
            )}
          </View>
          {note ? (
            <View style={styles.noteRow}>
              <AlignLeft size={12} color={colors.textMuted} />
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
                <AlignLeft size={12} color={colors.textMuted} />
                <Text style={styles.addNoteText}>Add note...</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

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
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, gap: 4 },
  description: {
    color: colors.textPrimary,
    fontSize: typography.md,
    fontWeight: "600",
    lineHeight: 20,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  date: { color: colors.textMuted, fontSize: typography.xs },
  dot: { color: colors.textMuted, fontSize: typography.xs },
  noteRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  noteText: {
    color: colors.textMuted,
    fontSize: typography.xs,
    fontStyle: "italic",
    flex: 1,
  },
  addNoteText: { color: colors.textMuted, fontSize: typography.xs },
  amount: { fontSize: typography.md, fontWeight: "700", marginTop: 2 },
  amountIncoming: { color: colors.success },
  amountOutgoing: { color: colors.textPrimary },
  nftImage: {
    width: "100%",
    height: 160,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
});
