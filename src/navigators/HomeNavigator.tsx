import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { colors, typography, spacing } from "../theme";
import { HomeScreen } from "../screens/HomeScreen";
import { JournalScreen } from "../screens/JournalScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof MaterialCommunityIcon>["name"];

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
  name: IconName;
  focusedName: IconName;
};
function TabIcon({
  name,
  focusedName,
  focused,
  color,
  size,
}: TabIconProps & { name: string; focusedName: string }) {
  return (
    <MaterialCommunityIcon
      name={focused ? focusedName : name}
      size={size}
      color={color}
    />
  );
}

export function HomeNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="view-dashboard-outline"
              focusedName="view-dashboard"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Journal"
        component={HomeScreen}
        options={{
          tabBarIcon: (props) => (
            <TabIcon {...props} name="book-outline" focusedName="book" />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={JournalScreen}
        options={{
          tabBarIcon: (props) => (
            <TabIcon {...props} name="chart-line" focusedName="chart-line" />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: (props) => (
            <TabIcon {...props} name="cog-outline" focusedName="cog" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  tabLabel: {
    fontSize: typography.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
