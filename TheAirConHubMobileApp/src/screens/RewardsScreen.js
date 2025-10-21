// src/screens/RewardsScreen.js

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Star, Trophy, Gamepad2 } from 'lucide-react-native';
import { styles } from '../styles/AppStyles';

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

export default RewardsScreen;