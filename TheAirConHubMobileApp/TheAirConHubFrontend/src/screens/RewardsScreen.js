// src/screens/RewardsScreen.js

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
// Removed unused icons (Clock, ChevronUp/Down)
import { Star, Trophy, Gamepad2, ChevronRight } from 'lucide-react-native'; 
import { styles } from '../styles/AppStyles';

// NEW: Simple button component to launch games immediately
const PlayGamesButton = ({ onOpenGame }) => {
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.gameBanner} // Re-using your existing banner style for consistency
        onPress={() => onOpenGame('unlimited_play')} // Pass a generic ID
      >
        <View style={styles.gameBannerContent}>
          <View style={{ marginRight: 15 }}>
            <Gamepad2 size={32} color="white" />
          </View>
          
          <View style={styles.gameBannerText}>
            <Text style={styles.gameBannerTitle}>Play Games & Earn Rewards</Text>
            <Text style={styles.gameBannerSubtitle}>
              Play anytime to earn points for discounts!
            </Text>
          </View>
          
          <ChevronRight size={24} color="white" />
        </View>
      </TouchableOpacity>
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
      {/* Header Section */}
      <View style={styles.rewardsHeader}>
        <Text style={styles.screenHeaderTitle}>Rewards</Text>
        <View style={styles.pointsCard}>
          <Star size={48} color="#FBBF24" fill="#FBBF24" />
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsLabel}>Points Available</Text>
        </View>
      </View>

      <View style={styles.rewardsContent}>
        {/* NEW: Single Button to Play Games */}
        <PlayGamesButton onOpenGame={onOpenGame} />

        {/* Rewards List */}
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