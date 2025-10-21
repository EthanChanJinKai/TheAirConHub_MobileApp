import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Calendar,
  Gift,
  User,
  MapPin,
  Star,
  Clock,
  Wrench,
  Droplet,
  Zap,
  Wind,
  Hammer,
  Sparkles,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  Trophy,
  Gamepad2,
  X,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

// ==================== COMPONENTS ====================

// Toast Message Component
const ToastMessage = ({ visible, message, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
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
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Service Card Component
const ServiceCard = ({ Icon, title, color, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
    <View style={[styles.serviceIconContainer, { backgroundColor: color }]}>
      <Icon size={28} color="white" />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
  </TouchableOpacity>
);

// Booking Card Component
const BookingCard = ({ service, date, status, tech, time }) => (
  <View style={styles.bookingCard}>
    <View style={styles.bookingHeader}>
      <Text style={styles.bookingService}>{service}</Text>
      <View
        style={[
          styles.bookingBadge,
          status === 'Active' ? styles.activeBadge : styles.completedBadge,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            status === 'Active' ? styles.activeText : styles.completedText,
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
    <View style={styles.bookingRow}>
      <Calendar size={14} color="#6B7280" />
      <Text style={styles.bookingInfo}>{date}</Text>
    </View>
    <View style={styles.bookingRow}>
      <Clock size={14} color="#6B7280" />
      <Text style={styles.bookingInfo}>{time}</Text>
    </View>
    <View style={styles.bookingRow}>
      <User size={14} color="#6B7280" />
      <Text style={styles.bookingInfo}>{tech}</Text>
    </View>
  </View>
);

// Menu Item Component
const MenuItem = ({ Icon, title, onPress, showChevron = true }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuContent}>
      <View style={styles.menuIconContainer}>
        <Icon size={20} color="#2563EB" />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
    </View>
    {showChevron && <ChevronRight size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

// ==================== GAME MODAL ====================

const GameModal = ({ visible, onClose, onEarnPoints }) => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });

  const startGame = () => {
    setScore(0);
    setGameActive(true);
    moveTarget();
  };

  const moveTarget = () => {
    setTargetPosition({
      x: Math.random() * 70 + 15,
      y: Math.random() * 50 + 15,
    });
  };

  const handleTargetPress = () => {
    const newScore = score + 10;
    setScore(newScore);
    moveTarget();

    if (newScore >= 100) {
      setGameActive(false);
      onEarnPoints(newScore);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.gameModalContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.gameContent}>
          <View style={styles.gameCard}>
            <Text style={styles.gameTitle}>Tap Challenge!</Text>
            <Text style={styles.gameSubtitle}>
              Tap the target 10 times to earn 100 points
            </Text>

            {!gameActive ? (
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.gameArea}>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{score} pts</Text>
                </View>

                <TouchableOpacity
                  onPress={handleTargetPress}
                  style={[
                    styles.target,
                    {
                      left: `${targetPosition.x}%`,
                      top: `${targetPosition.y}%`,
                    },
                  ]}
                >
                  <Sparkles size={32} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {score > 0 && !gameActive && (
              <View style={styles.successMessage}>
                <Text style={styles.successText}>
                  +{score} points earned! 🎉
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== SCREENS ====================

// Home Screen
const HomeScreen = ({ onShowToast }) => {
  const services = [
    { Icon: Wind, title: 'A/C Repair', color: '#3B82F6' },
    { Icon: Droplet, title: 'Plumbing', color: '#06B6D4' },
    { Icon: Zap, title: 'Electrical', color: '#EAB308' },
    { Icon: Wrench, title: 'Appliance', color: '#22C55E' },
    { Icon: Hammer, title: 'Carpentry', color: '#F97316' },
    { Icon: Sparkles, title: 'Cleaning', color: '#A855F7' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.homeHeader}>
        <View style={styles.homeHeaderTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.headerTitle}>Home Services</Text>
          </View>
          <View style={styles.avatarContainer}>
            <User size={24} color="white" />
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={18} color="white" />
          <Text style={styles.locationText}>Ulu Bedok, Singapore</Text>
        </View>
      </View>

      <View style={styles.homeContent}>
        <TouchableOpacity
          style={styles.rewardsBanner}
          onPress={() => onShowToast('View your rewards!')}
        >
          <View style={styles.rewardsBannerContent}>
            <View style={styles.rewardsBannerText}>
              <Text style={styles.rewardsBannerTitle}>Rewards Available!</Text>
              <Text style={styles.rewardsBannerSubtitle}>
                Earn points with every service
              </Text>
            </View>
            <Gift size={32} color="white" />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.servicesGrid}>
          {services.map((service, idx) => (
            <ServiceCard
              key={idx}
              Icon={service.Icon}
              title={service.title}
              color={service.color}
              onPress={() =>
                onShowToast(`Booking ${service.title} - Coming soon!`)
              }
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Bookings Screen
const BookingsScreen = () => {
  const [activeTab, setActiveTab] = useState('active');

  const activeBookings = [
    {
      service: 'A/C Repair',
      date: 'Oct 22, 2025',
      time: '2:00 PM - 4:00 PM',
      status: 'Active',
      tech: 'John Smith',
    },
    {
      service: 'Plumbing Fix',
      date: 'Oct 23, 2025',
      time: '10:00 AM - 12:00 PM',
      status: 'Active',
      tech: 'Mary Johnson',
    },
  ];

  const pastBookings = [
    {
      service: 'Electrical Work',
      date: 'Oct 15, 2025',
      time: '3:00 PM - 5:00 PM',
      status: 'Completed',
      tech: 'Robert Lee',
    },
    {
      service: 'A/C Maintenance',
      date: 'Oct 10, 2025',
      time: '9:00 AM - 11:00 AM',
      status: 'Completed',
      tech: 'Sarah Wong',
    },
    {
      service: 'Carpentry',
      date: 'Oct 5, 2025',
      time: '1:00 PM - 3:00 PM',
      status: 'Completed',
      tech: 'David Tan',
    },
  ];

  const bookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeaderTitle}>My Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.activeTabText,
            ]}
          >
            Active ({activeBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}
          >
            Past ({pastBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.screenContent}>
        {bookings.map((booking, idx) => (
          <BookingCard key={idx} {...booking} />
        ))}
      </ScrollView>
    </View>
  );
};

// Rewards Screen
const RewardsScreen = ({ onShowToast, onOpenGame, points }) => {
  const rewards = [
    { title: '$10 Service Discount', points: 500, available: true },
    { title: '$25 Service Discount', points: 1000, available: true },
    { title: 'Free A/C Checkup', points: 750, available: true },
    { title: '$50 Service Discount', points: 2000, available: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.rewardsHeader}>
        <Text style={styles.screenHeaderTitle}>Rewards</Text>
        <View style={styles.pointsCard}>
          <Star size={48} color="#FBBF24" fill="#FBBF24" />
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsLabel}>Points Available</Text>
        </View>
      </View>

      <View style={styles.rewardsContent}>
        <TouchableOpacity style={styles.gameBanner} onPress={onOpenGame}>
          <View style={styles.gameBannerContent}>
            <View style={styles.gameBannerText}>
              <Text style={styles.gameBannerTitle}>Play & Earn</Text>
              <Text style={styles.gameBannerSubtitle}>
                Tap the game to earn bonus points!
              </Text>
            </View>
            <Gamepad2 size={40} color="white" />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Available Rewards</Text>
        {rewards.map((reward, idx) => (
          <View key={idx} style={styles.rewardCard}>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <View style={styles.rewardPoints}>
                <Trophy size={16} color="#FBBF24" />
                <Text style={styles.rewardPointsText}>{reward.points} points</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.redeemButton,
                (!reward.available || points < reward.points) &&
                  styles.redeemButtonDisabled,
              ]}
              onPress={() =>
                reward.available && points >= reward.points
                  ? onShowToast(`Redeemed: ${reward.title}!`)
                  : onShowToast('Not enough points!')
              }
              disabled={!reward.available || points < reward.points}
            >
              <Text
                style={[
                  styles.redeemButtonText,
                  (!reward.available || points < reward.points) &&
                    styles.redeemButtonTextDisabled,
                ]}
              >
                Redeem
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Account Screen
const AccountScreen = ({ onShowToast }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.accountHeader}>
        <Text style={styles.screenHeaderTitle}>Account</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarContainer}>
            <User size={32} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>johndoe@email.com</Text>
            <Text style={styles.userPhone}>+65 9123 4567</Text>
          </View>
        </View>
      </View>

      <View style={styles.accountContent}>
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <MenuItem
          Icon={Settings}
          title="Account Settings"
          onPress={() => onShowToast('Settings - Coming soon!')}
        />
        <MenuItem
          Icon={HelpCircle}
          title="Help & Support"
          onPress={() => onShowToast('Help & Support - Coming soon!')}
        />
        <MenuItem
          Icon={LogOut}
          title="Logout"
          onPress={() => onShowToast('Logout - Coming soon!')}
          showChevron={false}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0 (MVP)</Text>
        <Text style={styles.footerText}>© 2025 TheAirConHub</Text>
      </View>
    </ScrollView>
  );
};

// ==================== MAIN APP ====================

export default function App() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [gameVisible, setGameVisible] = useState(false);
  const [points, setPoints] = useState(850);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleEarnPoints = (earnedPoints) => {
    setPoints((prev) => prev + earnedPoints);
    showToast(`You earned ${earnedPoints} points!`);
  };

  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <Container style={styles.safeArea}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
          }}
        >
          <Tab.Screen
            name="Home"
            options={{
              tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            }}
          >
            {() => <HomeScreen onShowToast={showToast} />}
          </Tab.Screen>

          <Tab.Screen
            name="Bookings"
            component={BookingsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Calendar size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Rewards"
            options={{
              tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
            }}
          >
            {() => (
              <RewardsScreen
                onShowToast={showToast}
                onOpenGame={() => setGameVisible(true)}
                points={points}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Account"
            options={{
              tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
            }}
          >
            {() => <AccountScreen onShowToast={showToast} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>

      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />

      <GameModal
        visible={gameVisible}
        onClose={() => setGameVisible(false)}
        onEarnPoints={handleEarnPoints}
      />
    </Container>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    width: (width - 64) / 2,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIconContainer: {
    borderRadius: 50,
    padding: 12,
    marginBottom: 8,
  },
  serviceTitle: {
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingService: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bookingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  completedBadge: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#065F46',
  },
  completedText: {
    color: '#4B5563',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingInfo: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 50,
    padding: 8,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  homeHeader: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  homeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    color: '#BFDBFE',
    fontSize: 14,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 12,
  },
  locationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  homeContent: {
    paddingHorizontal: 16,
    marginTop: -24,
  },
  rewardsBanner: {
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  rewardsBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsBannerText: {
    flex: 1,
  },
  rewardsBannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardsBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  screenHeader: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  screenHeaderTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  rewardsHeader: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  pointsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  rewardsContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  gameBanner: {
    backgroundColor: '#9333EA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gameBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameBannerText: {
    flex: 1,
  },
  gameBannerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardPointsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  redeemButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  redeemButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  redeemButtonTextDisabled: {
    color: '#6B7280',
  },
  accountHeader: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileAvatarContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 50,
    padding: 16,
    marginRight: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  accountContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  gameModalContainer: {
    flex: 1,
    backgroundColor: '#2563EB',
  },
  gameHeader: {
    paddingTop: 48,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  gameContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  gameCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameArea: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    height: 320,
    position: 'relative',
    overflow: 'hidden',
  },
  scoreContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  target: {
    position: 'absolute',
    backgroundColor: '#EF4444',
    borderRadius: 50,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successMessage: {
    marginTop: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});