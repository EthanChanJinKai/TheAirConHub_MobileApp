// src/components/ToastMessage.js

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../styles/AppStyles';

// Toast Message Component
const ToastMessage = ({ visible, message, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible, opacity, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default ToastMessage;