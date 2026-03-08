import React, { useCallback, useEffect, useState } from "react";
import { Bell, Settings, ArrowUpRight, Wallet } from "lucide-react-native";
import { usePortfolio } from "../hooks/usePortfolio";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing, typography, borderRadius } from "../theme";
import TransactionCard, { Transaction } from "../components/TransactionCard";
import { useAuthorization } from "../utils/useAuthorization";
import { MOCK_TRANSACTIONS } from "../constants/mockData";
import { RootStackParamList } from "../types/navigation";
import { NarrationPrompt } from "./NarrationPromptScreen";
import { useTransactions } from "../hooks/useTransactions";
import PrimaryButton from "../components/PrimaryButton";
import * as Notifications from "expo-notifications";

// notification handler configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Inside HomeScreen component

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { selectedAccount } = useAuthorization();
  const [refreshing, setRefreshing] = React.useState(false);
  const [promptTxHash, setPromptTxHash] = useState<string>("");
  const [promptDescription, setPromptDescription] = useState<string>("");

  const {
    login,
    logout,
    checkExistingAuth,
    isAuthenticated,
    isLoading,
    authState,
    setAuthState,
  } = useAuth();

  useEffect(() => {
    const init = async () => {
      const hasToken = await checkExistingAuth();
      if (!hasToken) {
        setAuthState("idle");
      }
    };
    init();
  }, []);

  useEffect(() => {
    // handle notification tap — open NarrationPrompt
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.screen === "NarrationPrompt" && data?.txHash) {
          setPromptTxHash(data.txHash);
          setPromptDescription(data.description ?? "");
          setShowNarrationPrompt(true);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  //TODO - WILL REMOVE
  const handleLogin = async () => {
    console.log("Login button pressed");
    await login();
  };
  //fetching transactions
  const {
    data,
    isLoading: txLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions(isAuthenticated);
  const transactions = data?.pages?.flatMap((page) => page.transactions) ?? [];

  //portfolio data
  const { data: portfolio } = usePortfolio(isAuthenticated);

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

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.txHash}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={handleTransactionPress}
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ paddingVertical: spacing.md }}
            />
          ) : null
        }
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
                  <Bell size={20} stroke={colors.textSecondary} />
                </TouchableOpacity>
                {isAuthenticated ? (
                  <TouchableOpacity
                    style={styles.avatarButton}
                    onPress={logout}
                  >
                    <Text style={styles.avatarText}>
                      {walletAddress?.slice(0, 2).toUpperCase() ?? "??"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.avatarButton} onPress={login}>
                    <Wallet size={16} stroke={colors.textPrimary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {!isAuthenticated ? (
              <View style={styles.connectContainer}>
                <Text style={styles.connectTitle}>Welcome to Memo</Text>
                <Text style={styles.connectSubtitle}>
                  Connect your Solana wallet to start annotating your
                  transactions
                </Text>
                <PrimaryButton
                  label={
                    authState === "connecting"
                      ? "Opening Wallet..."
                      : authState === "signing"
                        ? "Sign the message..."
                        : authState === "verifying"
                          ? "Verifying..."
                          : "Connect Wallet"
                  }
                  onPress={handleLogin}
                  loading={isLoading}
                />
                {authState === "error" && (
                  <Text style={styles.errorText}>
                    Authentication failed. Try again.
                  </Text>
                )}
              </View>
            ) : (
              <>
                <View style={styles.portfolioCard}>
                  <Text style={styles.portfolioLabel}>
                    EST. PORTFOLIO VALUE
                  </Text>
                  <View style={styles.portfolioRow}>
                    <View>
                      <Text style={styles.portfolioValue}>
                        ${portfolio?.usdValue ?? "0.00"}
                      </Text>
                      <Text style={styles.portfolioSol}>
                        {portfolio?.solBalance ?? "0.0000"} SOL
                      </Text>
                    </View>
                    <View style={styles.changeBadge}>
                      <Text style={styles.changeText}>
                        1 SOL = ${portfolio?.solPrice ?? "0.00"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>JOURNAL ACTIVITY</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewAll}>View All ›</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={txLoading}
            onRefresh={refetch}
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
        txDescription={promptDescription}
        onSave={(note, category, notarize) => {
          console.log("Saved:", { note, category, notarize });
        }}
      />

      {/* <NarrationPrompt
        visible={showNarrationPrompt}
        onDismiss={() => setShowNarrationPrompt(false)}
        txDescription="You swapped 10.5 SOL for 2,500 USDC via Jupiter"
        onSave={(note, category, notarize) => {
          console.log("Saved:", { note, category, notarize });
          // TODO: call backend API to save narration
        }}
      /> */}
      <NarrationPrompt
        visible={showNarrationPrompt}
        onDismiss={() => setShowNarrationPrompt(false)}
        txDescription={promptDescription}
        onSave={(note, category, notarize) => {
          console.log("Saved:", { note, category, notarize });
          // TODO: wire to backend
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
  portfolioSol: {
    color: colors.textPrimary + "CC",
    fontSize: typography.sm,
    fontWeight: "500",
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
  connectContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  connectTitle: {
    fontSize: typography.xxl,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  connectSubtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sm,
    textAlign: "center",
  },
});
