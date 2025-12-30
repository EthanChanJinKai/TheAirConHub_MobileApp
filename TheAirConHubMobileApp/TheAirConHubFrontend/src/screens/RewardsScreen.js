// src/screens/RewardsScreen.js

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Star, Trophy, Gamepad2, ChevronRight } from 'lucide-react-native'; 
import { useFocusEffect } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { API_URL } from '../config';
import { styles } from '../styles/AppStyles';

const PlayGamesButton = ({ onOpenGame }) => {
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.gameBanner}
        onPress={() => onOpenGame('unlimited_play')}
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

const RewardsScreen = ({ onShowToast, onOpenGame, points: initialPoints }) => {
  const [currentPoints, setCurrentPoints] = useState(initialPoints || 0);

  useEffect(() => {
    setCurrentPoints(initialPoints);
  }, [initialPoints]);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const session = await AsyncStorage.getItem('userSession');
          
          // --- FIX: If no session, just stop here (don't call API) ---
          if (!session) {
            setCurrentPoints(0); 
            return;
          }
          // -----------------------------------------------------------

          const user = JSON.parse(session);
          const response = await fetch(`${API_URL}/Users/${user.userId}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });

          if (response.ok) {
            const data = await response.json();
            setCurrentPoints(data.pointsBalance || 0); 
          }
        } catch (error) {
          console.error("Failed to fetch points:", error);
        }
      };

      fetchUserData();
    }, [])
  );

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
          
          {/* Displays the synced points */}
          <Text style={styles.pointsValue}>{currentPoints}</Text>
          
          <Text style={styles.pointsLabel}>Points Available</Text>
        </View>
      </View>

      <View style={styles.rewardsContent}>
        <PlayGamesButton onOpenGame={onOpenGame} />

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
                (!reward.available || currentPoints < reward.points) &&
                  styles.redeemButtonDisabled,
              ]}
              onPress={() =>
                reward.available && currentPoints >= reward.points
                  ? onShowToast(`Redeemed: ${reward.title}!`)
                  : onShowToast('Not enough points!')
              }
              disabled={!reward.available || currentPoints < reward.points}
            >
              <Text
                style={[
                  styles.redeemButtonText,
                  (!reward.available || currentPoints < reward.points) &&
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