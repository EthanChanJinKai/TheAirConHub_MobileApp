import React, { useRef, useCallback, useEffect } from "react";
import { View, Text, PanResponder, Animated, Platform } from "react-native";
import { styles } from "../../../styles/AppStyles";

// --- Pure Helper Functions (moved outside) ---

/**
 * Converts a value (e.g., 1.0) within a min/max range
 * into an angle (e.g., -150deg) within a 300-degree arc.
 */
const valueToAngle = (val, min, max) => {
  const percentage = (val - min) / (max - min);
  // Map 0% -> -150deg, 100% -> 150deg
  return percentage * 300 - 150;
};

/**
 * Converts an angle (e.g., -150deg) from the 300-degree arc
 * back into a value (e.g., 1.0) within the min/max range.
 */
const angleToValue = (angle, min, max, step) => {
  // Clamp angle to the allowed [-150, 150] range
  const clampedAngle = Math.max(-150, Math.min(150, angle));

  const percentage = (clampedAngle + 150) / 300;
  const newValue = min + percentage * (max - min);

  // Round to the nearest step
  const steppedValue = Math.round(newValue / step) * step;
  // Final clamp to ensure we don't exceed min/max due to rounding
  return Math.max(min, Math.min(max, steppedValue));
};

// --- Component ---

const RotatingKnob = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}) => {
  const knobRef = useRef(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const knobCenter = useRef({ x: 0, y: 0 });
  const isInteracting = useRef(false);
  const lastAngle = useRef(valueToAngle(value, min, max));

  // Memoize helpers with component props
  const memoizedValueToAngle = useCallback(
    (val) => valueToAngle(val, min, max),
    [min, max]
  );

  const memoizedAngleToValue = useCallback(
    (angle) => angleToValue(angle, min, max, step),
    [min, max, step]
  );

  // Set initial rotation based on external value changes
  useEffect(() => {
    // Only update if not currently interacting
    if (!isInteracting.current) {
      const angle = memoizedValueToAngle(value);
      rotation.setValue(angle);
      lastAngle.current = angle;
    }
  }, [value, memoizedValueToAngle]); 

  // --- Interaction Handler ---
  const handleInteraction = useCallback((clientX, clientY) => {
    if (!knobCenter.current.x) return; // Not measured yet

    const deltaX = clientX - knobCenter.current.x;
    const deltaY = clientY - knobCenter.current.y;

    // --- FIX FOR WEB/NATIVE COORDINATE SYSTEM ---
    // We must convert from screen coordinates (Y+ down) 
    // to a Cartesian system (Y+ up) for atan2.
    // We do this by negating deltaY.
    const cartesianY = -deltaY; 

    // Get raw angle. atan2(x, y) gives 0 at the top.
    let rawAngle = (Math.atan2(deltaX, cartesianY) * (180 / Math.PI));
    // rawAngle is now in the range [-180, 180], where 0 is Top.

    // --- NEW LOGIC for "sticking" at limits ---
    
    // Check if the current pointer angle is in the dead zone (bottom 60 degrees)
    const isInDeadZone = rawAngle > 150 || rawAngle < -150;
    
    let angleToSet; // This will be the final angle we use

    if (isInDeadZone) {
      // User is in the dead zone.
      // We must "stick" to the last known limit.
      const atMax = lastAngle.current === 150;
      const atMin = lastAngle.current === -150;

      if (atMax) {
        angleToSet = 150; // Stick to max
      } else if (atMin) {
        angleToSet = -150; // Stick to min
      } else {
        // User started in the dead zone, snap to nearest limit
        angleToSet = (rawAngle > 150) ? 150 : -150;
      }
    } else {
      // User is in the "live" zone [-150, 150].
      // We must check for jumps across the dead zone.
      const atMax = lastAngle.current === 150;
      const atMin = lastAngle.current === -150;

      // If at max, only allow movement "down" (e.g., to 140)
      if (atMax && rawAngle < 0) { // Trying to jump from 150 to e.g. -140
        angleToSet = 150; // Stay stuck
      } 
      // If at min, only allow movement "up" (e.g., to -140)
      else if (atMin && rawAngle > 0) { // Trying to jump from -150 to e.g. 140
        angleToSet = -150; // Stay stuck
      } 
      // Otherwise, movement is valid
      else {
        angleToSet = rawAngle;
      }
    }
    
    // `angleToSet` is now the desired, "non-jumping" angle,
    // clamped between -150 and 150.
    
    // Only update if the angle has meaningfully changed
    if (Math.abs(angleToSet - lastAngle.current) < 0.5) {
      return;
    }

    const newValue = memoizedAngleToValue(angleToSet);
    
    // Update state and animation
    onChange(newValue);
    rotation.setValue(angleToSet);
    lastAngle.current = angleToSet;

  }, [onChange, memoizedAngleToValue]);

  // --- Measure Knob Position ---
  const measureKnob = () => {
    knobRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // Get center of knob relative to the viewport
      const centerX = pageX + width / 2;
      const centerY = pageY + height / 2;
      knobCenter.current = { x: centerX, y: centerY };
    });
  };

  // --- PanResponder (Gestures) ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        isInteracting.current = true;
        measureKnob(); // Ensure position is up-to-date
        
        const { pageX, pageY } = evt.nativeEvent.touches 
          ? evt.nativeEvent.touches[0] 
          : evt.nativeEvent;
        handleInteraction(pageX, pageY);
      },

      onPanResponderMove: (evt) => {
        if (!isInteracting.current) return;
        
        const { pageX, pageY } = evt.nativeEvent.touches 
          ? evt.nativeEvent.touches[0] 
          : evt.nativeEvent;
        handleInteraction(pageX, pageY);
      },

      onPanResponderRelease: () => {
        isInteracting.current = false;
      },
      onPanResponderTerminate: () => {
        isInteracting.current = false;
      },
    })
  ).current;

  // --- Interpolate Rotation ---
  const rotateInterpolate = rotation.interpolate({
    inputRange: [-150, 150],
    outputRange: ["-150deg", "150deg"],
    extrapolate: "clamp", // Ensure it doesn't go past the limits
  });

  return (
    <View style={styles.rotatingKnobContainer}>
      <Text style={styles.rotatingKnobLabel}>{label}</Text>

      {/* We need this wrapper for layout measurement */}
      <View 
        ref={knobRef} 
        onLayout={measureKnob} 
        style={styles.rotatingKnobWrapper} 
        {...panResponder.panHandlers}
      >
        {/* Knob base */}
        <View style={styles.rotatingKnobBase}>
          {/* Rotating knob */}
          <Animated.View
            style={[
              styles.rotatingKnob,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            {/* Indicator line */}
            <View style={styles.rotatingKnobIndicator} />
          </Animated.View>

          {/* Center dot */}
          <View style={styles.rotatingKnobCenter} />
        </View>
      </View>

      {/* Value display */}
      <Text style={styles.rotatingKnobValue}>
        {value.toFixed(1)}
        {unit}
      </Text>
      <Text style={styles.rotatingKnobRange}>
        {min} - {max}
        {unit}
      </Text>
    </View>
  );
};

export default RotatingKnob;

