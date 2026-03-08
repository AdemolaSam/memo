import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react-native";
import { borderRadius, colors, spacing, typography } from "../theme";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide: () => void;
  duration?: number;
}

const ICONS = {
  success: <CheckCircle size={18} color={colors.success} />,
  error: <XCircle size={18} color={colors.error} />,
  warning: <AlertCircle size={18} color={colors.warning} />,
  info: <Info size={18} color={colors.primary} />,
};

const BG_COLORS = {
  success: colors.success + "20",
  error: colors.error + "20",
  warning: colors.warning + "20",
  info: colors.primary + "20",
};

const BORDER_COLORS = {
  success: colors.success + "60",
  error: colors.error + "60",
  warning: colors.warning + "60",
  info: colors.primary + "60",
};

export function Toast({
  visible,
  message,
  type = "info",
  onHide,
  duration = 3000,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: BG_COLORS[type],
          borderColor: BORDER_COLORS[type],
        },
      ]}
    >
      {ICONS[type]}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

// hook for easy usage
export function useToast() {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: "", type: "info" });

  const show = (message: string, type: ToastType = "info") => {
    setToast({ visible: true, message, type });
  };

  const hide = () => setToast((prev) => ({ ...prev, visible: false }));

  return { toast, show, hide };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    zIndex: 999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  message: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sm,
    fontWeight: "500",
  },
});
