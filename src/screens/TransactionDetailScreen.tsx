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
  Linking,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  MoreVertical,
  ExternalLink,
  Shield,
  CheckCircle,
  Edit3,
} from "lucide-react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { borderRadius, colors, spacing, typography } from "../theme";
import PrimaryButton from "../components/PrimaryButton";
import ViewerRow from "../components/ViewerRow";
import MetaRow from "../components/MetaRow";
import CategorySelector from "../components/CategorySelector";
import { RootStackParamList } from "../types/navigation";
import { useTransaction } from "../hooks/useTransaction";
import {
  saveNarration,
  updateNarration,
  notarize,
  addViewer,
  removeViewer,
} from "../services/transactionApi";
import { useQueryClient } from "@tanstack/react-query";
import * as crypto from "expo-crypto";
import { Toast, useToast } from "../components/Toast";
import { useEncryption } from "../hooks/useEncryption";
import { encryptNote, decryptNote } from "../utils/encryption";

export function TransactionDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "TransactionDetail">>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { txHash } = route.params;

  const { data: tx, isLoading } = useTransaction(txHash);

  const [note, setNote] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [viewers, setViewers] = useState<string[]>([]);
  const [newViewerWallet, setNewViewerWallet] = useState<string>("");
  const [showViewerInput, setShowViewerInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notarizing, setNotarizing] = useState(false);
  const { show, hide, toast } = useToast();
  const { getKeypair, deriving } = useEncryption();

  // populate state from fetched tx
  React.useEffect(() => {
    if (tx) {
      const loadNote = async () => {
        if (tx.narration?.encryptedText) {
          const keypair = await getKeypair();
          const decrypted = decryptNote(
            tx.narration.encryptedText,
            keypair.publicKey,
            keypair.secretKey,
          );
          setNote(decrypted ?? "");
        }
        setCategory(tx.narration?.category ?? "");
        setViewers(
          tx.narration?.viewers?.map((v: any) => v.viewerWallet) ?? [],
        );
      };
      loadNote();
    }
  }, [tx]);

  const handleSaveNarration = async () => {
    if (!note && !category) return;
    try {
      setSaving(true);
      const keypair = await getKeypair();
      const encrypted = encryptNote(note, keypair.publicKey, keypair.secretKey);
      if (tx?.narration) {
        await updateNarration(txHash, encrypted, category);
      } else {
        await saveNarration(txHash, encrypted, category);
      }
      queryClient.invalidateQueries({ queryKey: ["transaction", txHash] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      show("Note saved!", "success");
    } catch (err) {
      console.error("Save narration failed:", err);
      show("Failed to save note", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNotarize = async () => {
    if (!note) {
      return;
    }
    try {
      setNotarizing(true);
      // compute SHA-256 hash of the note client-side
      const hash = await crypto.digestStringAsync(
        crypto.CryptoDigestAlgorithm.SHA256,
        note,
      );
      await notarize(txHash, hash);
      queryClient.invalidateQueries({ queryKey: ["transaction", txHash] });
      show("Notarized!!", "success");
    } catch (err) {
      console.error("Notarize failed:", err);
      show("Failed to notarize", "error");
    } finally {
      setNotarizing(false);
    }
  };

  const handleAddViewer = async () => {
    if (!newViewerWallet.trim()) return;
    try {
      await addViewer(txHash, newViewerWallet.trim(), note);
      setViewers((prev) => [...prev, newViewerWallet.trim()]);
      setNewViewerWallet("");
      setShowViewerInput(false);
      show("Viewer added", "success");
    } catch (err) {
      console.error("Add viewer failed:", err);
      show("Failed to add viewer", "error");
    }
  };

  const handleRemoveViewer = async (walletAddress: string) => {
    try {
      await removeViewer(txHash, walletAddress);
      setViewers((prev) => prev.filter((v) => v !== walletAddress));
      show("Viewer removed", "success");
    } catch (err) {
      console.error("Remove viewer failed:", err);
      show("Failed to remove viewer", "error");
    }
  };

  const handleShareReceipt = () => {
    navigation.navigate("ShareReceipt", { txHash } as never);
  };

  const handleSolscan = () => {
    Linking.openURL(`https://solscan.io/tx/${txHash}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xl }}
        />
      </SafeAreaView>
    );
  }

  if (!tx) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </SafeAreaView>
    );
  }

  const fee = tx.fee ? (tx.fee / 1e9).toFixed(6) : "N/A";
  const date = tx.timestamp
    ? new Date(tx.timestamp * 1000).toLocaleString()
    : "N/A";
  const isNotarized = tx.narration?.isNotarized ?? false;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.screen}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hide}
        />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Detail</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: tx.transactionError
                    ? colors.error
                    : colors.success,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: tx.transactionError ? colors.error : colors.success },
              ]}
            >
              {tx.transactionError ? "FAILED" : "CONFIRMED"}
            </Text>
            {isNotarized && (
              <View style={styles.notarizedBadge}>
                <Shield size={18} color={colors.primary} />

                <Text style={styles.notarizedBadgeText}>NOTARIZED</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {tx.description || "Unknown Transaction"}
          </Text>
          <Text style={styles.network}>Completed on Solana Mainnet-Beta</Text>

          {/* Meta info box */}
          <View style={styles.metaBox}>
            <MetaRow label="Network Fee" value={`${fee} SOL`} />
            <MetaRow label="Timestamp" value={date} />
            <MetaRow
              label="Signature"
              value={`${txHash.slice(0, 8)}...${txHash.slice(-8)}`}
              externalLink
              onPress={handleSolscan}
            />
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
              <TouchableOpacity
                style={styles.editIcon}
                onPress={handleSaveNarration}
                disabled={saving}
              >
                <Edit3 size={16} color={colors.textMuted} />
                <Text style={styles.editIconText}>{saving ? "..." : "✎"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save button */}
          {(note || category) && (
            <PrimaryButton
              label={saving ? "Saving..." : "Save Note"}
              onPress={handleSaveNarration}
              loading={saving}
              variant="outlined"
            />
          )}

          {/* Notarize */}
          <TouchableOpacity
            style={[
              styles.notarizeRow,
              isNotarized && { borderColor: colors.success + "40" },
            ]}
            onPress={handleNotarize}
            activeOpacity={0.7}
            disabled={notarizing || isNotarized || !note}
          >
            <View style={styles.notarizeLeft}>
              <View style={styles.notarizeIcon}>
                <Text style={styles.notarizeIconText}>🛡</Text>
              </View>
              <View>
                <Text style={styles.notarizeTitle}>
                  {isNotarized ? "Notarized ✓" : "Notarize"}
                </Text>
                <Text style={styles.notarizeSubtitle}>
                  {isNotarized
                    ? "Hash written on-chain"
                    : "Write a tamper-proof hash on-chain"}
                </Text>
              </View>
            </View>
            {notarizing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
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

            {showViewerInput && (
              <View style={styles.viewerInputRow}>
                <TextInput
                  value={newViewerWallet}
                  onChangeText={setNewViewerWallet}
                  placeholder="Wallet address"
                  placeholderTextColor={colors.textMuted}
                  style={styles.viewerInput}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.viewerAddConfirm}
                  onPress={handleAddViewer}
                >
                  <Text style={styles.viewerAddConfirmText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.addViewerButton}
              onPress={() => setShowViewerInput(!showViewerInput)}
              activeOpacity={0.7}
            >
              <Text style={styles.addViewerText}>
                {showViewerInput ? "Cancel" : "+ Add Viewer"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* View on Solscan */}
          <TouchableOpacity
            style={styles.solscanRow}
            activeOpacity={0.7}
            onPress={handleSolscan}
          >
            <ExternalLink size={18} color={colors.textSecondary} />
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
  notarizedBadge: {
    backgroundColor: colors.success + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  notarizedBadgeText: {
    color: colors.success,
    fontSize: typography.xs,
    fontWeight: "600",
  },
  viewerInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  viewerInput: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.sm,
  },
  viewerAddConfirm: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewerAddConfirmText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: typography.sm,
  },
});
