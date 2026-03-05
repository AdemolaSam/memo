import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing, typography, borderRadius } from "../theme";
import TransactionCard, { Transaction } from "../components/TransactionCard";
import { useAuthorization } from "../utils/useAuthorization";
import { MOCK_TRANSACTIONS } from "../constants/mockData";
import { RootStackParamList } from "../types/navigation";
import { NarrationPrompt } from "./NarrationPromptScreen";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { selectedAccount } = useAuthorization();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleTransactionPress = useCallback(
    (txHash: string) => {
      navigation.navigate("TransactionDetail", { txHash });
    },
    [navigation],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: refetch transactions from backend
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const walletAddress = selectedAccount?.publicKey?.toString();

  const [showNarrationPrompt, setShowNarrationPrompt] = useState(false);

  // simulate push notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNarrationPrompt(true);
    }, 3000);
    return () => clearTimeout(timer); // cleanup on unmount
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={MOCK_TRANSACTIONS}
        keyExtractor={(item) => item.txHash}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={handleTransactionPress}
          />
        )}
        ListHeaderComponent={
          <>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.logoRow}>
                <View style={styles.logoIcon}>
                  <Text style={styles.logoText}>M</Text>
                </View>
                <Text style={styles.appName}>Memo</Text>
              </View>
              <View style={styles.topBarRight}>
                <TouchableOpacity style={styles.iconButton}>
                  <Text style={styles.iconButtonText}>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.avatarButton}>
                  <Text style={styles.avatarText}>
                    {walletAddress?.slice(0, 2).toUpperCase() ?? "??"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Portfolio Card */}
            <View style={styles.portfolioCard}>
              <Text style={styles.portfolioLabel}>EST. PORTFOLIO VALUE</Text>
              <View style={styles.portfolioRow}>
                <Text style={styles.portfolioValue}>$12,450.00</Text>
                <View style={styles.changeBadge}>
                  <Text style={styles.changeText}>↑ 2.4%</Text>
                </View>
              </View>
            </View>

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>JOURNAL ACTIVITY</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View All ›</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Connect your wallet to see your activity
            </Text>
          </View>
        }
      />

      <NarrationPrompt
        visible={showNarrationPrompt}
        onDismiss={() => setShowNarrationPrompt(false)}
        txDescription="You swapped 10.5 SOL for 2,500 USDC via Jupiter"
        onSave={(note, category, notarize) => {
          console.log("Saved:", { note, category, notarize });
          // TODO: call backend API to save narration
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: "800",
  },
  appName: {
    color: colors.textPrimary,
    fontSize: typography.xl,
    fontWeight: "700",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonText: {
    fontSize: typography.md,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: typography.xs,
    fontWeight: "700",
  },
  portfolioCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  portfolioLabel: {
    fontSize: typography.xs,
    color: colors.textPrimary + "CC",
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  portfolioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioValue: {
    fontSize: typography.xxxl,
    color: colors.textPrimary,
    fontWeight: "800",
  },
  changeBadge: {
    backgroundColor: colors.textPrimary + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  changeText: {
    color: colors.textPrimary,
    fontSize: typography.xs,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  viewAll: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.lg,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
});
