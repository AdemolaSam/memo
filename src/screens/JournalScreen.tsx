import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { borderRadius, colors, spacing, typography } from "../theme";
import PrimaryButton from "../components/PrimaryButton";
import { Sections } from "../constants/mockData";
import { JournalRow, JournaledTransaction } from "../components/JournalRow";

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

export function JournalScreen() {
  const navigation = useNavigation();
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // derived — recalculates when filters change
  const filteredSections = useMemo(() => {
    return Sections.map((section) => ({
      ...section,
      data: section.data.filter((tx: JournaledTransaction) => {
        if (
          categoryFilter !== "All Categories" &&
          tx.category.toUpperCase() !== categoryFilter.toUpperCase()
        ) {
          return false;
        }
        if (verifiedOnly && tx.status !== "VERIFIED") return false;
        return true;
      }),
    })).filter((section) => section.data.length > 0);
  }, [categoryFilter, verifiedOnly]);

  const totalCount = filteredSections.reduce(
    (acc, s) => acc + s.data.length,
    0,
  );

  const exportToCSV = () => {
    // TODO: call backend /api/export
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
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
            <Text style={styles.exportButtonText}>↓ Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {/* Date filter */}
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => {
            const idx = DATE_FILTERS.indexOf(dateFilter);
            setDateFilter(DATE_FILTERS[(idx + 1) % DATE_FILTERS.length]);
          }}
        >
          <Text style={styles.filterText}>📅 {dateFilter} ▾</Text>
        </TouchableOpacity>

        {/* Category filter */}
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => {
            const idx = CATEGORY_FILTERS.indexOf(categoryFilter);
            setCategoryFilter(
              CATEGORY_FILTERS[(idx + 1) % CATEGORY_FILTERS.length],
            );
          }}
        >
          <Text style={styles.filterText}>⊞ {categoryFilter} ▾</Text>
        </TouchableOpacity>

        {/* Verified filter */}
        <TouchableOpacity
          style={[styles.filterPill, verifiedOnly && styles.filterPillActive]}
          onPress={() => setVerifiedOnly(!verifiedOnly)}
        >
          <Text
            style={[styles.filterText, verifiedOnly && styles.filterTextActive]}
          >
            ✓ Verified
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL SELECTED</Text>
          <Text style={styles.summaryValue}>$12,842.50</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TRANSACTION COUNT</Text>
          <Text style={styles.summaryValue}>{totalCount} items</Text>
        </View>
      </View>

      {/* Transaction list */}
      <SectionList
        sections={filteredSections}
        keyExtractor={(item) => item.txHash}
        renderItem={({ item }) => (
          <JournalRow transaction={item} onPress={() => {}} />
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
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />

      {/* Export footer */}
      <View style={styles.footer}>
        <View style={styles.formatRow}>
          <Text style={styles.formatText}>FORMAT: CSV (ACCOUNTING READY)</Text>
          <TouchableOpacity>
            <Text style={styles.changeText}>CHANGE</Text>
          </TouchableOpacity>
        </View>
        <PrimaryButton
          label={`Export ${totalCount} Transactions`}
          onPress={exportToCSV}
          icon={<Text style={{ color: colors.textPrimary }}>↓</Text>}
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
