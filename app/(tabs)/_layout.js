import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  ScrollView,
  Easing,
  Image,
} from 'react-native';

import {
  Tabs,
  router,
  usePathname,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330);

const TAB_CONFIG = {
  index: {
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  billing: {
    label: 'Billing',
    icon: 'receipt-outline',
    activeIcon: 'receipt',
  },
  inventory: {
    label: 'Inventory',
    icon: 'cube-outline',
    activeIcon: 'cube',
  },
  reports: {
    label: 'Reports',
    icon: 'bar-chart-outline',
    activeIcon: 'bar-chart',
  },
};

const MAIN_MENU = [
  {
    label: 'Dashboard',
    icon: 'home-outline',
    route: '/(tabs)',
  },
  {
    label: 'Billing',
    icon: 'receipt-outline',
    route: '/(tabs)/billing',
  },
  {
    label: 'Inventory',
    icon: 'cube-outline',
    route: '/(tabs)/inventory',
  },
  {
    label: 'Reports',
    icon: 'bar-chart-outline',
    route: '/(tabs)/reports',
  },
];

const STOCK_MENU = [
  {
    label: 'Transfer Stock',
    icon: 'swap-horizontal-outline',
    route: '/transfer-stock',
  },
  {
    label: 'Low Stock',
    icon: 'warning-outline',
    route: '/low-stock',
  },
  {
    label: 'Raw Materials',
    icon: 'layers-outline',
    route: '/raw-materials',
  },
];

const PRODUCT_REQUEST_MENU = [
  {
    label: 'Request Dashboard',
    icon: 'grid-outline',
    route: '/product-requests',
  },
  {
    label: 'Add Product Request',
    icon: 'add-circle-outline',
    route: '/product-requests/add',
  },
  {
    label: 'All Requests',
    icon: 'list-outline',
    route: '/product-requests/all',
  },
];

const BUSINESS_MENU = [
  {
    label: 'Business Profile',
    icon: 'storefront-outline',
    route: '/more',
  },
  {
    label: 'Settings',
    icon: 'settings-outline',
    route: '/more',
  },
];

function AnimatedTab({ route, focused, onPress }) {
  const config = TAB_CONFIG[route.name];

  const scale = useRef(
    new Animated.Value(focused ? 1 : 0.92)
  ).current;

  const opacity = useRef(
    new Animated.Value(focused ? 1 : 0.7)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.92,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.7,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, opacity]);

  if (!config) return null;

  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Animated.View
        style={[
          styles.tabContent,
          focused && styles.activeTab,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Ionicons
          name={focused ? config.activeIcon : config.icon}
          size={21}
          color={focused ? C.primary : C.muted}
        />

        <Text
          style={[
            styles.tabText,
            {
              color: focused ? C.primary : C.muted,
            },
          ]}
        >
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.fixedWrapper}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View style={styles.nav}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <AnimatedTab
                key={route.key}
                route={route}
                focused={focused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

function SidebarItem({ item, active, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.sidebarPressable}
    >
      <Animated.View
        style={[
          styles.sidebarItem,
          active && styles.sidebarItemActive,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <View
          style={[
            styles.sidebarIconBox,
            active && styles.sidebarIconBoxActive,
          ]}
        >
          <Ionicons
            name={item.icon}
            size={21}
            color={active ? C.primary : '#514B69'}
          />
        </View>

        <Text
          style={[
            styles.sidebarItemText,
            active && styles.sidebarItemTextActive,
          ]}
        >
          {item.label}
        </Text>

        {active && <View style={styles.activeIndicator} />}
      </Animated.View>
    </Pressable>
  );
}

function SectionTitle({ children }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  );
}

function Sidebar({ visible, onClose, currentPath }) {
  const [requestsExpanded, setRequestsExpanded] = useState(
    currentPath.startsWith('/product-requests')
  );

  useEffect(() => {
    if (currentPath.startsWith('/product-requests')) {
      setRequestsExpanded(true);
    }
  }, [currentPath]);

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 360 : 280,
      easing: visible
        ? Easing.out(Easing.cubic)
        : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  const sidebarTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  const overlayOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sidebarScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  const contentScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.985],
  });

  const navigateTo = (route) => {
    onClose();

    setTimeout(() => {
      router.replace(route);
    }, 250);
  };

  const isActive = (route) => {
    if (route === '/(tabs)') {
      return (
        currentPath === '/' ||
        currentPath === '/index' ||
        currentPath === '/(tabs)'
      );
    }

    const cleanRoute = route
      .replace('/(tabs)', '')
      .replace('/', '');

    return Boolean(cleanRoute && currentPath.includes(cleanRoute));
  };

  const isProductRequestActive = (route) => {
    const normalizedPath = currentPath.replace(/\/$/, '') || '/';
    const normalizedRoute = route.replace(/\/$/, '') || '/';

    return normalizedPath === normalizedRoute;
  };

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={styles.sidebarLayer}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          {
            width: SIDEBAR_WIDTH,
            transform: [
              { translateX: sidebarTranslate },
              { scale: sidebarScale },
            ],
          },
        ]}
      >
        <SafeAreaView
          edges={['top', 'bottom']}
          style={styles.sidebarSafe}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarScroll}
          >
            {/* BRAND */}
            <View style={styles.brandHeader}>
              <View style={styles.brandLogo}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closePressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#514B69"
                />
              </Pressable>
            </View>

            {/* MAIN MENU */}
            <View style={styles.menuSection}>
              {MAIN_MENU.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  active={isActive(item.route)}
                  onPress={() => navigateTo(item.route)}
                />
              ))}
            </View>

            <View style={styles.menuDivider} />

            {/* STOCK MANAGEMENT */}
            <SectionTitle>STOCK MANAGEMENT</SectionTitle>

            <View style={styles.menuSection}>
              {STOCK_MENU.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  active={currentPath.includes(item.route)}
                  onPress={() => navigateTo(item.route)}
                />
              ))}
            </View>

            <View style={styles.menuDivider} />

            {/* PRODUCT REQUESTS */}
            <Pressable
              onPress={() => {
                setRequestsExpanded((previous) => !previous);
              }}
              style={[
                styles.sidebarItem,
                currentPath.startsWith('/product-requests') &&
                  styles.sidebarItemActive,
              ]}
            >
              <View
                style={[
                  styles.sidebarIconBox,
                  currentPath.startsWith('/product-requests') &&
                    styles.sidebarIconBoxActive,
                ]}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={21}
                  color={
                    currentPath.startsWith('/product-requests')
                      ? C.primary
                      : '#514B69'
                  }
                />
              </View>

              <Text
                style={[
                  styles.sidebarItemText,
                  currentPath.startsWith('/product-requests') &&
                    styles.sidebarItemTextActive,
                ]}
              >
                Product Requests
              </Text>

              <Ionicons
                name={requestsExpanded ? 'chevron-up' : 'chevron-down'}
                size={17}
                color="#7C7391"
              />
            </Pressable>

            {requestsExpanded && (
              <View style={styles.requestSubmenu}>
                {PRODUCT_REQUEST_MENU.map((item) => {
                  const active = isProductRequestActive(item.route);

                  return (
                    <Pressable
                      key={item.route}
                      onPress={() => navigateTo(item.route)}
                      style={[
                        styles.requestSubmenuItem,
                        active && styles.requestSubmenuItemActive,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={17}
                        color={active ? C.primary : '#746B88'}
                      />

                      <Text
                        style={[
                          styles.requestSubmenuText,
                          active && styles.requestSubmenuTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {active && (
                        <View style={styles.requestSubmenuDot} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={styles.menuDivider} />

            {/* BUSINESS */}
            <SectionTitle>BUSINESS</SectionTitle>

            <View style={styles.menuSection}>
              {BUSINESS_MENU.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  active={false}
                  onPress={() => navigateTo(item.route)}
                />
              ))}
            </View>

            {/* BUSINESS PROFILE */}
            <View style={styles.restaurantCard}>
              <View style={styles.restaurantIcon}>
                <Ionicons
                  name="storefront"
                  size={22}
                  color={C.primary}
                />
              </View>

              <View style={styles.restaurantInfo}>
                <Text
                  style={styles.restaurantName}
                  numberOfLines={2}
                >
                  Sri Lakshmi Restaurant
                </Text>

                <Text style={styles.restaurantLocation}>
                  Visakhapatnam
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#7C7391"
              />
            </View>

            {/* LOGOUT */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutPressed,
              ]}
              onPress={() => {
                onClose();

                setTimeout(() => {
                  router.replace('/login');
                }, 250);
              }}
            >
              <View style={styles.logoutIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#DC2626"
                />
              </View>

              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const currentPath = pathname || '/';

  const menuProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(menuProgress, {
      toValue: sidebarOpen ? 1 : 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen, menuProgress]);

  const menuRotate = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const menuScale = menuProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1],
  });

  return (
    <View style={styles.root}>
      {/* EXISTING BOTTOM TABS */}
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
          }}
        />

        <Tabs.Screen
          name="billing"
          options={{
            title: 'Billing',
          }}
        />

        <Tabs.Screen
          name="inventory"
          options={{
            title: 'Inventory',
          }}
        />

        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
          }}
        />
      </Tabs>

      {/* HAMBURGER */}
      <SafeAreaView
        pointerEvents="box-none"
        style={styles.hamburgerSafe}
        edges={['top']}
      >
        <View
          pointerEvents="box-none"
          style={styles.hamburgerRow}
        >
          <Pressable
            onPress={() => setSidebarOpen((previous) => !previous)}
            style={({ pressed }) => [
              styles.hamburgerButton,
              pressed && styles.hamburgerPressed,
            ]}
          >
            <Animated.View
              style={{
                transform: [
                  { rotate: menuRotate },
                  { scale: menuScale },
                ],
              }}
            >
              <Ionicons
                name={sidebarOpen ? 'close' : 'menu'}
                size={24}
                color={C.primary}
              />
            </Animated.View>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* SIDEBAR */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={currentPath}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  hamburgerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    pointerEvents: 'box-none',
  },

  hamburgerRow: {
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingLeft: 16,
    pointerEvents: 'box-none',
  },

  hamburgerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6DDF2',
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 5,
  },

  hamburgerPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.8,
  },

  fixedWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: C.border,
    ...Platform.select({
      android: {
        elevation: 15,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },

  safeArea: {
    backgroundColor: '#FFFFFF',
  },

  nav: {
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },

  tabButton: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContent: {
    minWidth: 58,
    height: 52,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  activeTab: {
    minWidth: 76,
    paddingHorizontal: 15,
    backgroundColor: C.primarySoft,
    borderRadius: 18,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: C.primary,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
    }),
  },

  tabText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },

  sidebarLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 14, 35, 0.48)',
  },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FAF8FF',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 30,
  },

  sidebarSafe: {
    flex: 1,
  },

  sidebarScroll: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 25,
  },

  brandHeader: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },

  brandLogo: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  logoImage: {
    width: 120,
    height: 120,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DDF2',
  },

  closePressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.7,
  },

  menuSection: {
    gap: 4,
  },

  sidebarPressable: {
    width: '100%',
  },

  sidebarItem: {
    minHeight: 56,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    position: 'relative',
  },

  sidebarItemActive: {
    backgroundColor: '#E9D9FF',
  },

  sidebarIconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sidebarIconBoxActive: {
    backgroundColor: '#FFFFFF',
  },

  sidebarItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#514B69',
    marginLeft: 9,
  },

  sidebarItemTextActive: {
    color: C.primary,
    fontWeight: '900',
  },

  activeIndicator: {
    width: 4,
    height: 27,
    borderRadius: 4,
    backgroundColor: C.primary,
    position: 'absolute',
    right: 4,
  },

  requestSubmenu: {
    marginLeft: 22,
    marginTop: 2,
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E4DDEE',
    gap: 3,
  },

  requestSubmenuItem: {
    minHeight: 43,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },

  requestSubmenuItemActive: {
    backgroundColor: '#FFF0D6',
  },

  requestSubmenuText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6F6683',
  },

  requestSubmenuTextActive: {
    color: C.primary,
    fontWeight: '800',
  },

  requestSubmenuDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
  },

  sectionTitleWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
  },

  sectionTitle: {
    fontSize: 10,
    color: '#8A819F',
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  menuDivider: {
    height: 1,
    backgroundColor: '#E4DDEE',
    marginHorizontal: 10,
    marginVertical: 12,
  },

  restaurantCard: {
    marginTop: 18,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E0F1',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  restaurantIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  restaurantInfo: {
    flex: 1,
    marginLeft: 9,
  },

  restaurantName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#211832',
    lineHeight: 16,
  },

  restaurantLocation: {
    fontSize: 9,
    color: '#8D859C',
    marginTop: 2,
    fontWeight: '600',
  },

  logoutButton: {
    marginTop: 10,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FCE1E4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  logoutPressed: {
    transform: [{ scale: 0.97 }],
  },

  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#DC2626',
    marginLeft: 10,
  },
});