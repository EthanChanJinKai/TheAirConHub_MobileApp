import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { styles } from "../../../styles/AppStyles";

const Knob = ({ label, value, min, max, step, onChange, unit }) => {
  return (
    <View style={styles.knobControl}>
      <Text style={styles.knobLabel}>{label}</Text>
      <View style={styles.knobSliderContainer}>
        <Slider
          style={styles.knobSlider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#6B7280"
          thumbTintColor="#3B82F6"
        />
      </View>
      <Text style={styles.knobValue}>
        {value.toFixed(1)}
        {unit}
      </Text>
      <Text style={styles.knobRange}>
        {min} - {max}
        {unit}
      </Text>
    </View>
  );
};

export default Knob;