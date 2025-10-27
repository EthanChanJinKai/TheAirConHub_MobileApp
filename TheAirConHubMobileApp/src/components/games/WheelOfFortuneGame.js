import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../styles/AppStyles";

const WheelOfFortuneGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  return (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>Wheel of Fortune</Text>
      <Text style={styles.gameSubtitle}>Coming Soon!</Text>
    </View>
  );
};

export default WheelOfFortuneGame;