// src/styles/AppStyles.js

import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  screenContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  toastText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    margin: 8,
    width: (width - 64) / 2,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },
  serviceIconContainer: {
    borderRadius: 50,
    padding: 12,
    marginBottom: 8,
  },
  serviceTitle: {
    color: "#1F2937",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bookingService: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  bookingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#D1FAE5",
  },
  completedBadge: {
    backgroundColor: "#F3F4F6",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeText: {
    color: "#065F46",
  },
  completedText: {
    color: "#4B5563",
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bookingInfo: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  menuItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: 50,
    padding: 8,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  homeHeader: {
    backgroundColor: "#2563EB",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  homeHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: {
    color: "#BFDBFE",
    fontSize: 14,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  avatarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    padding: 12,
  },
  locationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
  },
  homeContent: {
    paddingHorizontal: 16,
    marginTop: -24,
  },
  rewardsBanner: {
    backgroundColor: "#FBBF24",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    elevation: 5,
  },
  rewardsBannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardsBannerText: {
    flex: 1,
  },
  rewardsBannerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  rewardsBannerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -8,
  },
  screenHeader: {
    backgroundColor: "#2563EB",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  screenHeaderTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "white",
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // region Rewards Screen
  rewardsHeader: {
    backgroundColor: "#2563EB",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  pointsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    elevation: 5,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  rewardsContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  gameBanner: {
    backgroundColor: "#9333EA",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  gameBannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gameBannerText: {
    flex: 1,
  },
  gameBannerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gameBannerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  rewardCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  rewardPoints: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardPointsText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  redeemButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  redeemButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  redeemButtonText: {
    color: "white",
    fontWeight: "600",
  },
  redeemButtonTextDisabled: {
    color: "#6B7280",
  },
  // endregion

  // region Game Dropdown
  dropdownContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownList: {
    backgroundColor: "#842ed4ff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -12,
    paddingTop: 12,
    paddingHorizontal: 5,
    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  dropdownItemSubtitle: {
    fontSize: 13,
    color: "#090909ff",
    marginTop: 2,
  },
  // endregion

  // region Game Modal
  gameHubTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  gameHubSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  gameGridContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  gameGridRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gameGridItem: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
    minHeight: 150,
  },
  gameGridImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EBF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gameGridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  gameGridTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  gameGridPoints: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
  },
  backToHubButton: {
    backgroundColor: "#6B7280",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  backToHubButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  gameHubList: {
    width: "100%",
  },
  // endregion

  accountHeader: {
    backgroundColor: "#2563EB",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    elevation: 5,
  },
  profileAvatarContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: 50,
    padding: 16,
    marginRight: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  accountContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    letterSpacing: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  gameModalContainer: {
    flex: 1,
    backgroundColor: "#2563EB",
  },
  gameHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    marginTop: -30,
    paddingRight: 5,
  },
  gameContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  gameCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  gameSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  gameArea: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    height: 320,
    position: "relative",
    overflow: "hidden",
  },
  scoreContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
    zIndex: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB",
  },
  target: {
    position: "absolute",
    backgroundColor: "#EF4444",
    borderRadius: 50,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  successMessage: {
    marginTop: 16,
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    color: "#065F46",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  // region Pipeline Game
  pipelineGameArea: {
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  movesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 15,
  },
  pipeLabel: {
    position: "absolute",
    fontSize: 24,
    transform: [{ rotate: "0deg" }],
  },
  pipelineGrid: {
    width: "100%",
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  pipeTile: {
    width: "25%",
    height: "25%",
    padding: 5,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative", // Add this for absolute positioning of children
  },
  pipeImage: {
    width: "100%",
    height: "100%",
    // Add explicit dimensions for debugging
    minWidth: 40,
    minHeight: 40,
  },
  pipe: {
    width: "100%",
    height: "100%",
  },
  // endregion

  // region Leak Game
  // region Leak Game
  leakGameReadyContainer: {
    padding: 15,
    alignItems: "center",
  },
  leakGameIcon: {
    marginBottom: 10,
  },
  leakGameHowTo: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: "100%",
    alignSelf: "flex-start",
  },
  leakGameHowToTitle: {
    fontWeight: "bold",
    color: "#93C5FD",
    marginBottom: 6,
    fontSize: 14,
  },
  leakGameHowToText: {
    color: "#D1D5DB",
    fontSize: 12,
    lineHeight: 18,
  },
  leakGameStartButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
  },
  leakGameStartButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  leakGameOverContainer: {
    padding: 15,
    alignItems: "center",
  },
  leakGameFinalScore: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#3B82F6",
    marginVertical: 10,
  },
  leakGameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
  },
  leakGameHeaderItem: {
    alignItems: "center",
    flex: 1,
  },
  leakGameHeaderLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  leakGameHeaderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  leakGameSuccessMessage: {
    backgroundColor: "#064E3B",
    borderColor: "#059669",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  leakGameWarningMessage: {
    backgroundColor: "#78350F",
    borderColor: "#F59E0B",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  leakGameStatusTitle: {
    fontWeight: "bold",
    color: "white",
    fontSize: 13,
  },
  leakGameStatusText: {
    color: "#D1D5DB",
    fontSize: 11,
  },
  leakGameSection: {
    marginBottom: 8,
  },
  // --- SineWaveDisplay Styles ---
  sineWaveContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  sineWaveTargetBorder: {
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  sineWaveLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    color: "#D1D5DB",
  },
  sineWaveBackground: {
    backgroundColor: "#111827",
    borderRadius: 4,
    padding: 3,
    width: "100%",
    overflow: "hidden",
  },
  // --- Controls Styles ---
  leakGameControlsContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  leakGameControlsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  leakGameKnobRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginLeft: 20,
    paddingHorizontal: 5,
  },
  // --- Knob/Slider Styles ---
  knobControl: {
    alignItems: "center",
    width: "70%",
  },
  knobLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
    textAlign: "center",
  },
  knobSliderContainer: {
    width: "100%",
    height: 40,
  },
  knobSlider: {
    width: "100%",
    height: 40,
  },
  knobValue: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  knobRange: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  leakGameLockButton: {
    paddingVertical: 10,
    borderRadius: 8,
  },
  leakGameLockButtonActive: {
    backgroundColor: "#10B981",
  },
  leakGameLockButtonInactive: {
    backgroundColor: "#4B5563",
  },
  leakGameLockButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  // --- Rotating Knob Styles ---
  // In your AppStyles.js, update the styles:

rotatingKnobContainer: {
  alignItems: 'center',
  margin: 10,
},

rotatingKnobLabel: {
  fontSize: 14,
  color: '#fff',
  marginBottom: 8,
  fontWeight: 'bold',
},

rotatingKnobWrapper: {
  alignItems: 'center',
  justifyContent: 'center',
},

rotatingKnobBase: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#2a2a2a',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: '#555',
  position: 'relative',
},

rotatingKnob: {
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: '#444',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#666',
},

rotatingKnobIndicator: {
  width: 4,
  height: 20,
  backgroundColor: '#fff',
  position: 'absolute',
  top: 5,
},

rotatingKnobCenter: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#888',
  position: 'absolute',
},
  // endregion
});
