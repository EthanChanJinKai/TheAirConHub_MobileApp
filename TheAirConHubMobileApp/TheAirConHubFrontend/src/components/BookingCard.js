// src/components/BookingCard.js

import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, Clock, User } from 'lucide-react-native';
import { styles } from '../styles/AppStyles';

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

export default BookingCard;