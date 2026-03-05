import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { borderRadius, colors, spacing, typography } from "../theme";
import PrimaryButton from "../components/PrimaryButton";
import ViewerRow from "../components/ViewerRow";
import MetaRow from "../components/MetaRow";
import CategorySelector from "../components/CategorySelector";
import { MOCK_TRANSACTIONS } from "../constants/mockData";
import { RootStackParamList } from "../types/navigation";

export function TransactionDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "TransactionDetail">>();
  const navigation = useNavigation();
  const { txHash } = route.params;

  const txDetails = MOCK_TRANSACTIONS.find((i) => i.txHash === txHash);

  const [note, setNote] = useState<string>(txDetails?.note ?? "");
  const [category, setCategory] = useState<string>(txDetails?.category ?? "");
  const [viewers, setViewers] = useState<string[]>([
    "7xWp...9K2m",
    "Ax3y...Lp0q",
  ]);

  const handleRemoveViewer = (walletAddress: string) => {
    setViewers((prev) => prev.filter((v) => v !== walletAddress));
  };

  const handleAddViewer = () => {
    // TODO: open input modal to add viewer wallet address
  };

  const handleNotarize = () => {
    // TODO: construct memo transaction and sign via MWA
  };

  const handleShareReceipt = () => {
    navigation.navigate("ShareReceipt", { txHash } as never);
  };

  if (!txDetails) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Detail</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>CONFIRMED</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{txDetails.description}</Text>
          <Text style={styles.network}>Completed on Solana Mainnet-Beta</Text>

          {/* Meta info box */}
          <View style={styles.metaBox}>
            <MetaRow label="Network Fee" value="0.000005 SOL" />
            <MetaRow
              label="Program Used"
              value="Jupiter AG"
              externalLink
              onPress={() => {}}
            />
            <MetaRow label="Timestamp" value={txDetails.date} />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <CategorySelector selected={category} onSelect={setCategory} />
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TRANSACTION NOTE</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={note}
                multiline
                numberOfLines={4}
                placeholder="What was this for?"
                placeholderTextColor={colors.textMuted}
                onChangeText={setNote}
                style={styles.input}
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.editIcon}>
                <Text style={styles.editIconText}>✎</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notarize */}
          <TouchableOpacity
            style={styles.notarizeRow}
            onPress={handleNotarize}
            activeOpacity={0.7}
          >
            <View style={styles.notarizeLeft}>
              <View style={styles.notarizeIcon}>
                <Text style={styles.notarizeIconText}>🛡</Text>
              </View>
              <View>
                <Text style={styles.notarizeTitle}>Notarize</Text>
                <Text style={styles.notarizeSubtitle}>
                  Write a tamper-proof hash on-chain
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* Viewers */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VIEWERS</Text>
            <View style={styles.viewersList}>
              {viewers.map((wallet) => (
                <ViewerRow
                  key={wallet}
                  walletAddress={wallet}
                  onRemove={handleRemoveViewer}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.addViewerButton}
              onPress={handleAddViewer}
              activeOpacity={0.7}
            >
              <Text style={styles.addViewerText}>+ Add Viewer</Text>
            </TouchableOpacity>
          </View>

          {/* View on Solscan */}
          <TouchableOpacity style={styles.solscanRow} activeOpacity={0.7}>
            <Text style={styles.solscanIcon}>🗄</Text>
            <Text style={styles.solscanText}>View on Solscan</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed footer */}
        <View style={styles.footer}>
          <PrimaryButton
            label="Share Receipt"
            onPress={handleShareReceipt}
            icon={<Text style={{ color: colors.textPrimary }}>↗</Text>}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: typography.xl,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: "600",
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  moreIcon: {
    color: colors.textPrimary,
    fontSize: typography.xl,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.success,
    fontSize: typography.xs,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  description: {
    color: colors.textPrimary,
    fontSize: typography.xxl,
    fontWeight: "800",
    lineHeight: 32,
  },
  network: {
    color: colors.textMuted,
    fontSize: typography.sm,
  },
  metaBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  inputContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    color: colors.textPrimary,
    fontSize: typography.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  editIcon: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  editIconText: {
    color: colors.textMuted,
    fontSize: typography.md,
  },
  notarizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + "40",
  },
  notarizeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  notarizeIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  notarizeIconText: {
    fontSize: typography.lg,
  },
  notarizeTitle: {
    color: colors.textPrimary,
    fontSize: typography.md,
    fontWeight: "600",
  },
  notarizeSubtitle: {
    color: colors.textMuted,
    fontSize: typography.xs,
    marginTop: 2,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: typography.xl,
  },
  viewersList: {
    gap: spacing.sm,
  },
  addViewerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  addViewerText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    fontWeight: "500",
  },
  solscanRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  solscanIcon: {
    fontSize: typography.lg,
  },
  solscanText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
