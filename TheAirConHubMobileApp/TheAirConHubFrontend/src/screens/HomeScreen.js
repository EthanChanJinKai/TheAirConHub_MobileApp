// src/screens/HomeScreen.js

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Wind, Droplet, Zap, Wrench, Hammer, Sparkles, User, MapPin, Gift } from 'lucide-react-native';
import ServiceCard from '../components/ServiceCard';
import { styles } from '../styles/AppStyles';

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

export default HomeScreen;