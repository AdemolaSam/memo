import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { ArrowLeft, Share2 } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "../theme";
import { ShareReceipt } from "../components/ShareReceipt";
import { useTransaction } from "../hooks/useTransaction";
import { useEncryption } from "../hooks/useEncryption";
import { decryptNote } from "../utils/encryption";
import { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/useAuth";

type RoutePropType = RouteProp<RootStackParamList, "ShareReceipt">;

export function ShareReceiptScreen() {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation();
  const { txHash } = route.params;
  const { isAuthenticated } = useAuth();
  const { data: tx, isLoading } = useTransaction(txHash);
  const { getKeypair } = useEncryption();
  const [decryptedNote, setDecryptedNote] = React.useState<
    string | undefined
  >();

  // decrypt note if exists
  React.useEffect(() => {
    if (tx?.narration?.encryptedText) {
      const load = async () => {
        const keypair = await getKeypair();
        const plain = decryptNote(
          tx.narration.encryptedText,
          keypair.publicKey,
          keypair.secretKey,
        );
        setDecryptedNote(plain ?? undefined);
      };
      load();
    }
  }, [tx]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Memo Receipt\n\n${tx?.description ?? ""}\n\nVerify on Solscan:\nhttps://solscan.io/tx/${txHash}`,
        url: `https://solscan.io/tx/${txHash}`,
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
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

  const solAmount = tx.nativeTransfers?.[0]?.amount
    ? `${(tx.nativeTransfers[0].amount / 1e9).toFixed(4)} SOL`
    : "N/A";

  const usdAmount = tx.nativeTransfers?.[0]?.amount
    ? `$${((tx.nativeTransfers[0].amount / 1e9) * 150).toFixed(2)}`
    : "N/A";

  const date = tx.timestamp
    ? new Date(tx.timestamp * 1000).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} stroke={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Receipt</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={20} stroke={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ShareReceipt
          txHash={txHash}
          description={tx.description ?? "Transaction"}
          amount={solAmount}
          amountUsd={usdAmount}
          date={date}
          category={tx.narration?.category}
          isNotarized={tx.narration?.isNotarized}
          notarizationTx={tx.narration?.notarization?.memoTxHash}
          note={decryptedNote}
        />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareFullButton} onPress={handleShare}>
          <Share2 size={18} stroke={colors.textPrimary} />
          <Text style={styles.shareFullButtonText}>Share Receipt</Text>
        </TouchableOpacity>
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
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.lg,
    fontWeight: "600",
  },
  shareButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  shareFullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  shareFullButtonText: {
    color: colors.textPrimary,
    fontSize: typography.md,
    fontWeight: "600",
  },
  errorText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
