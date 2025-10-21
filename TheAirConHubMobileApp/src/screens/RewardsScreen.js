// src/screens/RewardsScreen.js

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
// Import Clock icon for time slots
import { Star, Trophy, Gamepad2, ChevronDown, ChevronUp, Clock } from 'lucide-react-native'; 
import { styles } from '../styles/AppStyles';

// Renamed and repurposed component for the Game Slot Dropdown
const GameSlotDropdown = ({ onOpenGame }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // CONCEPTUAL DATA: In a real app, 'played' status would be fetched from a server.
  // We define 3 rewarded slots (the daily limit) + 1 unlimited practice slot.
  const availableSlots = [
    // Rewarded Slots (Limit of 3 per day)
    { time: 'Morning Slot (6AM-12PM)', key: 'slot_1', status: 'Available', played: false },
    { time: 'Afternoon Slot (12PM-6PM)', key: 'slot_2', status: 'Used', played: true }, // Example of a used slot
    { time: 'Evening Slot (6PM-12AM)', key: 'slot_3', status: 'Available', played: false },
    // Unlimited Practice Slot (No points rewarded, always available)
    { time: 'Unlimited Practice', key: 'practice', status: 'No Points', played: false, isPractice: true },
  ];

  // Calculate remaining plays based on the conceptual data
  const rewardedPlaysUsed = availableSlots.filter(slot => slot.played && !slot.isPractice).length;
  const rewardedPlaysRemaining = 3 - rewardedPlaysUsed;

  const getSlotColor = (slot) => {
    if (slot.played && !slot.isPractice) return '#9CA3AF'; // Gray for used slots
    if (slot.isPractice) return '#F59E0B'; // Orange for practice mode
    return '#10B981'; // Green for available slots
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.gameBanner,
          isOpen && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={styles.gameBannerContent}>
          <View style={styles.gameBannerText}>
            <Text style={styles.gameBannerTitle}>Play Games & Earn Rewards</Text>
            <Text style={styles.gameBannerSubtitle}>
              {isOpen 
                ? 'Select an available play slot' 
                : `Rewarded Plays Remaining: ${rewardedPlaysRemaining}/3`}
            </Text>
          </View>
          {isOpen ? (
            <ChevronUp size={24} color="white" />
          ) : (
            <ChevronDown size={24} color="white" />
          )}
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          {availableSlots.map((slot, index) => {
            const isDisabled = slot.played && !slot.isPractice;
            const statusColor = getSlotColor(slot);
            
            return (
              <TouchableOpacity
                key={slot.key}
                style={[
                  styles.dropdownItem,
                  // Use a specific style for disabled/used slots if needed
                  isDisabled && { opacity: 0.6 },
                  index === availableSlots.length - 1 && styles.dropdownItemLast // Apply last item style
                ]}
                onPress={() => {
                  if (!isDisabled) {
                    setIsOpen(false); // Close dropdown
                    // Pass the slot key to the parent to open the Game Modal Hub
                    onOpenGame(slot.key); 
                  }
                }}
                disabled={isDisabled}
              >
                {/* Clock icon for time slots */}
                <Clock size={20} color={isDisabled ? '#9CA3AF' : '#3B82F6'} /> 
                
                <View style={styles.dropdownItemTextContainer}>
                  <Text style={[
                    styles.dropdownItemTitle, 
                    isDisabled && { color: '#9CA3AF' }
                  ]}>
                    {slot.time}
                  </Text>
                  <Text style={[
                    styles.dropdownItemSubtitle, 
                    isDisabled && { color: '#9CA3AF' }
                  ]}>
                    Status: <Text style={{ color: statusColor, fontWeight: '700' }}>{slot.status}</Text>
                  </Text>
                </View>
                
                <Text style={{ color: statusColor, fontWeight: 'bold' }}>
                  {isDisabled ? 'Used' : 'Play'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};
// -------------------------------------------------------------------------

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
        {/* Use the new GameSlotDropdown */}
        <GameSlotDropdown onOpenGame={onOpenGame} />

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

export default RewardsScreen;