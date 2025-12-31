import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';

const ToastMessage = ({ visible, message, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade In
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto Hide after 2 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onHide) onHide();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: fadeAnim }
      ]}
      pointerEvents="none" // Allows clicks to pass through the transparent part
    >
      <View style={styles.toastBox}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, 
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999, // iOS Z-Index
    elevation: 100, // Android Elevation (Container)
  },
  toastBox: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    
    // --- SHADOWS ---
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    
    
    elevation: 100, 
    zIndex: 9999,   
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default ToastMessage;