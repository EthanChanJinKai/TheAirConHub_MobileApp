
import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../styles/AppStyles";

const BlockTheHazeGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  return (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>Block the Haze</Text>
      <Text style={styles.gameSubtitle}>Coming Soon!</Text>
    </View>
  );
};

export default BlockTheHazeGame;