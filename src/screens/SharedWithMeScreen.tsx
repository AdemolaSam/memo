import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Users, ArrowUpRight } from "lucide-react-native";
import { borderRadius, colors, spacing, typography } from "../theme";
import { useSharedWithMe } from "../hooks/useSharedWithMe";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SharedWithMeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated } = useAuth();
  const { data: shared, isLoading } = useSharedWithMe(isAuthenticated);

  const renderItem = ({ item }: { item: any }) => {
    const ownerWallet = item.narration?.user?.walletAddress ?? "";
    const shortOwner = `${ownerWallet.slice(0, 4)}...${ownerWallet.slice(-4)}`;
    const txHash = item.narration?.txHash ?? "";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("TransactionDetail", { txHash })}
        activeOpacity={0.75}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconBox}>
            <Users size={18} stroke={colors.primary} />
          </View>
          <View style={styles.cardCenter}>
            <Text style={styles.txHash} numberOfLines={1}>
              {`${txHash.slice(0, 8)}...${txHash.slice(-8)}`}
            </Text>
            <Text style={styles.sharedBy}>Shared by {shortOwner}</Text>
            <Text style={styles.category}>
              {item.narration?.category ?? "Uncategorized"}
            </Text>
          </View>
        </View>
        <ArrowUpRight size={18} stroke={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shared With Me</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xl }}
        />
      ) : (
        <FlatList
          data={shared}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={48} stroke={colors.textMuted} />
              <Text style={styles.emptyText}>Nothing shared with you yet</Text>
              <Text style={styles.emptySubtext}>
                When someone shares a transaction narration with your wallet
                address it will appear here
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.xl,
    fontWeight: "700",
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  cardCenter: {
    flex: 1,
    gap: 3,
  },
  txHash: {
    color: colors.textPrimary,
    fontSize: typography.sm,
    fontWeight: "600",
  },
  sharedBy: {
    color: colors.textMuted,
    fontSize: typography.xs,
  },
  category: {
    color: colors.primary,
    fontSize: typography.xs,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
