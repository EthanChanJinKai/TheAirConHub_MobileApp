// src/screens/RewardsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Star, Trophy, Gamepad2, ChevronRight, AlertCircle } from 'lucide-react-native'; 
import { useFocusEffect } from '@react-navigation/native'; // Import this
import { styles } from '../styles/AppStyles';

const PlayGamesButton = ({ onOpenGame, attemptsLeft }) => {
  const isOutOfAttempts = attemptsLeft === 0;
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.gameBanner, isOutOfAttempts && { opacity: 0.8, backgroundColor: '#64748B' }]}
        onPress={() => onOpenGame('unlimited_play')}
      >
        <View style={styles.gameBannerContent}>
          <View style={{ marginRight: 15 }}>
            {isOutOfAttempts ? <AlertCircle size={32} color="#CBD5E1" /> : <Gamepad2 size={32} color="white" />}
          </View>
          <View style={styles.gameBannerText}>
            <Text style={styles.gameBannerTitle}>
                {isOutOfAttempts ? "Daily Limit Reached" : "Play Games & Earn Rewards"}
            </Text>
            <Text style={styles.gameBannerSubtitle}>
              {isOutOfAttempts 
                ? "Come back tomorrow for more tries!" 
                : `${attemptsLeft}/3 Daily Attempts Remaining`}
            </Text>
          </View>
          <ChevronRight size={24} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Accept 'refreshUserData'
const RewardsScreen = ({ onShowToast, onOpenGame, points, attemptsLeft, refreshUserData }) => {
  
  // --- REFRESH DATA WHENEVER SCREEN IS FOCUSED ---
  useFocusEffect(
    useCallback(() => {
      if (refreshUserData) {
        refreshUserData(); // Ask App.js to fetch latest points/attempts
      }
    }, [refreshUserData])
  );
  // -----------------------------------------------

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
        <PlayGamesButton onOpenGame={onOpenGame} attemptsLeft={attemptsLeft} />

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
              style={[styles.redeemButton, (!reward.available || points < reward.points) && styles.redeemButtonDisabled]}
              onPress={() => reward.available && points >= reward.points ? onShowToast(`Redeemed: ${reward.title}!`) : onShowToast('Not enough points!')}
              disabled={!reward.available || points < reward.points}
            >
              <Text style={[styles.redeemButtonText, (!reward.available || points < reward.points) && styles.redeemButtonTextDisabled]}>Redeem</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default RewardsScreen;