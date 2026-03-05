import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  // outlined variant for secondary actions like "Save Only"
  variant?: "filled" | "outlined";
  icon?: React.ReactNode;
};

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "filled",
  icon,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        variant === "outlined" ? styles.outlined : styles.filled,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outlined" ? colors.primary : colors.textPrimary}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.label,
              variant === "outlined" && styles.labelOutlined,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.md,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  labelOutlined: {
    color: colors.primary,
  },
});
