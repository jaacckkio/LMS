import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
  label,
  badge,
}: {
  name: IconName;
  focused: boolean;
  label: string;
  badge?: boolean;
}) {
  return (
    <View style={styles.iconWrap}>
      <View>
        <Ionicons name={name} size={22} color={focused ? Colors.primary : Colors.textMuted} />
        {badge && <View style={styles.badge} />}
      </View>
      <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();

  // Red dot badge on "This Week" tab:
  // Shows when signed-in user has an unmade pick and deadline is <24h.
  // Stubbed false — requires a hook to check current-gameweek pick state.
  const showPickBadge = false; // TODO: derive from pick state + deadline proximity

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="leagues"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'trophy' : 'trophy-outline'} focused={focused} label="Leagues" />
          ),
        }}
      />
      <Tabs.Screen
        name="pick"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'football' : 'football-outline'}
              focused={focused}
              label="This Week"
              badge={!!user && showPickBadge}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 82 : 62,
    paddingBottom: Platform.OS === 'ios' ? 24 : 6,
    paddingTop: 8,
  },
  iconWrap: { alignItems: 'center', gap: 3, minWidth: 60 },
  label: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, flexShrink: 1 },
  labelActive: { color: Colors.primary },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
});
