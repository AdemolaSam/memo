import React from "react";
import { View, Text } from "react-native";
import { colors } from "../theme";

export function ShareReceiptScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.textPrimary }}>Share Receipt</Text>
    </View>
  );
}
