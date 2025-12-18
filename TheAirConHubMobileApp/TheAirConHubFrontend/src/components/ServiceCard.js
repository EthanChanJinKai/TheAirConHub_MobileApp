// src/components/ServiceCard.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/AppStyles';

// Service Card Component
const ServiceCard = ({ Icon, title, color, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
    <View style={[styles.serviceIconContainer, { backgroundColor: color }]}>
      <Icon size={28} color="white" />
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
  </TouchableOpacity>
);

export default ServiceCard;