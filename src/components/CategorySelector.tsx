import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";

const CATEGORIES = [
  "DeFi",
  "Freelance",
  "Personal",
  "Business",
  "Transfer",
  "NFT",
  "Revenue",
  "Hardware",
  "Software SaaS",
  "Business Dining",
];

type Props = {
  selected: string | null;
  onSelect: (category: string) => void;
};

export default function CategorySelector({ selected, onSelect }: Props) {
  return (
    <View>
      <Text style={styles.sectionLabel}>CATEGORY</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selected === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => onSelect(category)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected
                    ? styles.chipTextSelected
                    : styles.chipTextUnselected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: "transparent",
    borderColor: colors.border,
  },
  chipText: {
    fontSize: typography.sm,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: colors.textPrimary,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
});
