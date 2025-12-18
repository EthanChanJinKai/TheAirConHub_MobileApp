// src/screens/BookingsScreen.js

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import BookingCard from '../components/BookingCard';
import { styles } from '../styles/AppStyles';

const BookingsScreen = () => {
  const [activeTab, setActiveTab] = useState('active');

  const activeBookings = [
    {
      service: 'A/C Repair',
      date: 'Oct 22, 2025',
      time: '2:00 PM - 4:00 PM',
      status: 'Active',
      tech: 'John Smith',
    },
    {
      service: 'Plumbing Fix',
      date: 'Oct 23, 2025',
      time: '10:00 AM - 12:00 PM',
      status: 'Active',
      tech: 'Mary Johnson',
    },
  ];

  const pastBookings = [
    {
      service: 'Electrical Work',
      date: 'Oct 15, 2025',
      time: '3:00 PM - 5:00 PM',
      status: 'Completed',
      tech: 'Robert Lee',
    },
    {
      service: 'A/C Maintenance',
      date: 'Oct 10, 2025',
      time: '9:00 AM - 11:00 AM',
      status: 'Completed',
      tech: 'Sarah Wong',
    },
    {
      service: 'Carpentry',
      date: 'Oct 5, 2025',
      time: '1:00 PM - 3:00 PM',
      status: 'Completed',
      tech: 'David Tan',
    },
  ];

  const bookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeaderTitle}>My Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.activeTabText,
            ]}
          >
            Active ({activeBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}
          >
            Past ({pastBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.screenContent}>
        {bookings.map((booking, idx) => (
          <BookingCard key={idx} {...booking} />
        ))}
      </ScrollView>
    </View>
  );
};

export default BookingsScreen;