import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";
import CategorySelector from "../components/CategorySelector";
import PrimaryButton from "../components/PrimaryButton";
import AppModal from "../components/AppModal";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  txDescription: string;
  onSave: (note: string, category: string, notarize: boolean) => void;
};

export function NarrationPrompt({
  visible,
  onDismiss,
  txDescription,
  onSave,
}: Props) {
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<string>("");

  const handleSaveOnly = () => {
    onSave(note, category, false);
    onDismiss();
  };

  const handleSaveAndNotarize = () => {
    onSave(note, category, true);
    onDismiss();
  };

  const handleRemindLater = () => {
    onDismiss();
  };

  return (
    <AppModal visible={visible} onDismiss={onDismiss}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerText}>NEW TRANSACTION DETECTED</Text>
          </View>

          {/* Transaction summary */}
          <View style={styles.txSummary}>
            <Text style={styles.txDescription}>{txDescription}</Text>
          </View>

          {/* Note input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Add a note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What was this for?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={styles.input}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <CategorySelector selected={category} onSelect={setCategory} />

          {/* Buttons */}
          <View style={styles.buttons}>
            <PrimaryButton
              label="Save & Notarize"
              onPress={handleSaveAndNotarize}
              icon={<Text style={{ color: colors.textPrimary }}>🛡</Text>}
            />
            <PrimaryButton
              label="Save Only"
              variant="outlined"
              onPress={handleSaveOnly}
            />
            <TouchableOpacity
              onPress={handleRemindLater}
              style={styles.remindLater}
            >
              <Text style={styles.remindLaterText}>Remind me later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  headerText: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  txSummary: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txDescription: {
    color: colors.textPrimary,
    fontSize: typography.md,
    lineHeight: 22,
    fontWeight: "500",
  },
  inputSection: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.md,
    minHeight: 80,
  },
  buttons: {
    gap: spacing.sm,
  },
  remindLater: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  remindLaterText: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textDecorationLine: "underline",
  },
});
