import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Search,
  Download,
  Calendar,
  Grid,
  CheckSquare,
  ArrowLeft,
} from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { borderRadius, colors, spacing, typography } from "../theme";
import PrimaryButton from "../components/PrimaryButton";
import { JournalRow, JournaledTransaction } from "../components/JournalRow";
import { useJournal } from "../hooks/useJournal";
import { useAuth } from "../hooks/useAuth";
import { exportTransactions } from "../services/transactionApi";
import { RootStackParamList } from "../types/navigation";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useEncryption } from "../hooks/useEncryption";
import { decryptNote } from "../utils/encryption";

const DATE_FILTERS = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "All Time",
];
const CATEGORY_FILTERS = [
  "All Categories",
  "DeFi",
  "Freelance",
  "Personal",
  "Business",
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function JournalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch } = useJournal(isAuthenticated);
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { getKeypair } = useEncryption();
  const [decryptedSections, setDecryptedSections] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const filteredSections = useMemo(() => {
    return decryptedSections
      .map((section) => ({
        ...section,
        data: section.data.filter((tx: JournaledTransaction) => {
          if (
            categoryFilter !== "All Categories" &&
            tx.category.toUpperCase() !== categoryFilter.toUpperCase()
          )
            return false;
          if (verifiedOnly && tx.status !== "VERIFIED") return false;
          return true;
        }),
      }))
      .filter((section) => section.data.length > 0);
  }, [decryptedSections, categoryFilter, verifiedOnly]);

  const totalCount = filteredSections.reduce(
    (acc, s) => acc + s.data.length,
    0,
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!data?.sections) return;

    const decryptAll = async () => {
      const keypair = await getKeypair();
      const sections = data.sections.map((section: any) => ({
        ...section,
        data: section.data.map((tx: any) => ({
          ...tx,
          // replace encrypted note with decrypted text

          note: tx.note
            ? (decryptNote(tx.note, keypair.publicKey, keypair.secretKey) ??
              tx.description)
            : tx.description,
        })),
      }));
      setDecryptedSections(sections);
    };

    decryptAll();
  }, [data]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvBlob = await exportTransactions();

      // write to local file and share
      const fileUri = FileSystem.documentDirectory + "memo-export.csv";
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Memo Transactions",
        });
      };
      reader.readAsDataURL(csvBlob);
    } catch (err) {
      console.error("Export failed:", err);
      Alert.alert("Export Failed", "Could not export transactions. Try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleTransactionPress = (txHash: string) => {
    navigation.navigate("TransactionDetail", { txHash });
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Download size={14} color={colors.textPrimary} />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => {
            const idx = DATE_FILTERS.indexOf(dateFilter);
            setDateFilter(DATE_FILTERS[(idx + 1) % DATE_FILTERS.length]);
          }}
        >
          <Calendar size={12} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => {
            const idx = CATEGORY_FILTERS.indexOf(categoryFilter);
            setCategoryFilter(
              CATEGORY_FILTERS[(idx + 1) % CATEGORY_FILTERS.length],
            );
          }}
        >
          <Grid size={12} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, verifiedOnly && styles.filterPillActive]}
          onPress={() => setVerifiedOnly(!verifiedOnly)}
        >
          <CheckSquare
            size={12}
            color={verifiedOnly ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.filterText, verifiedOnly && styles.filterTextActive]}
          >
            Verified
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>ANNOTATED</Text>
          <Text style={styles.summaryValue}>{data?.total ?? 0} txns</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>FILTERED</Text>
          <Text style={styles.summaryValue}>{totalCount} items</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xl }}
        />
      ) : (
        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.txHash}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <JournalRow
              transaction={item}
              onPress={() => handleTransactionPress(item.txHash)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No annotated transactions</Text>
              <Text style={styles.emptySubtext}>
                Add notes to transactions from the Dashboard
              </Text>
            </View>
          }
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* Export footer */}
      <View style={styles.footer}>
        <View style={styles.formatRow}>
          <Text style={styles.formatText}>FORMAT: CSV (ACCOUNTING READY)</Text>
          <TouchableOpacity>
            <Text style={styles.changeText}>CHANGE</Text>
          </TouchableOpacity>
        </View>
        <PrimaryButton
          label={
            exporting ? "Exporting..." : `Export ${totalCount} Transaction(s)`
          }
          onPress={handleExport}
          loading={exporting}
          icon={<Download size={14} color={colors.textPrimary} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
    fontSize: typography.xl,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonText: {
    fontSize: typography.lg,
  },
  exportButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exportButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    fontWeight: "600",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterPillActive: {
    backgroundColor: colors.primary + "20",
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    fontWeight: "500",
  },
  filterTextActive: {
    color: colors.primary,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.xs,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.xxl,
    fontWeight: "800",
  },
  sectionHeader: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.xs,
    fontWeight: "700",
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: "600",
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: typography.sm,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  formatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formatText: {
    color: colors.textMuted,
    fontSize: typography.xs,
    fontWeight: "500",
    letterSpacing: 0.8,
  },
  changeText: {
    color: colors.primary,
    fontSize: typography.xs,
    fontWeight: "600",
  },
});
