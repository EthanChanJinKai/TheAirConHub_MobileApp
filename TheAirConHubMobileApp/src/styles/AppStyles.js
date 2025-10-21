// src/styles/AppStyles.js

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
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
  // region Rewards Screen
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
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
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
  // endregion

  // region Game Dropdown
  dropdownContainer: {
    // Keep the dropdown within the content area
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden', // Ensures the dropdown list stays within bounds
  },
  dropdownList: {
    backgroundColor: '#842ed4ff', // White background
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light gray border
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -12, // Overlap slightly with the header for a clean look
    paddingTop: 12, // Push content down past the overlap
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Very light gray separator
  },
  dropdownItemTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // Dark text
  },
  dropdownItemSubtitle: {
    fontSize: 13,
    color: '#090909ff', // Gray text for bonus
    marginTop: 2,
  },
  // endregion

  // region Game Modal
  gameHubTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameHubSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  gameGridContainer: {
    paddingHorizontal: 10, // Padding around the entire grid
    paddingBottom: 20,
  },
  gameGridRow: {
    justifyContent: 'space-between', // Distribute items evenly
    marginBottom: 10, // Space between rows
  },
  gameGridItem: {
    flex: 1, // Allows items to take equal space in a row
    marginHorizontal: 5, // Small gap between items
    backgroundColor: '#FFFFFF', // White background for each game box
    borderRadius: 15, // Curved edges
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 150, // Ensure items have a minimum height
  },
  gameGridImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular placeholder for image
    backgroundColor: '#EBF4FF', // Light blue background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gameGridImage: {
    width: '100%', // Adjust if using actual images
    height: '100%',
    borderRadius: 30,
    resizeMode: 'contain',
  },
  gameGridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  gameGridPoints: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981', // Green for points
    textAlign: 'center',
  },
  backToHubButton: {
    backgroundColor: '#6B7280', // Gray color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  backToHubButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // endregion 

  
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
  //region Pipeline Game 
  pipelineGameArea: {
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  movesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 15,
  },
  pipeLabel: {
    position: 'absolute',
    fontSize: 24,
    // Ensure the labels don't rotate with the tile
    transform: [{ rotate: '0deg' }], 
  },
  pipelineGrid: {
    width: '100%',
    aspectRatio: 1, // Ensure the grid is square
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pipeTile: {
    width: `${100 / 4}%`, // 4x4 grid
    height: `${100 / 4}%`, 
    padding: 5,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    // Apply tile border to differentiate segments if needed
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pipeImage: {
    width: '100%', // Match the tile size
    height: '100%', // Match the tile size
    resizeMode: 'contain', // Ensure the image fits inside the bounds
},
  // endregion
});