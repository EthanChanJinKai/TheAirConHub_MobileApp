import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from "react-native";
import { RotateCcw } from "lucide-react-native";
import { styles as appStyles } from "../../styles/AppStyles";

// Map values to your specific GIF files
const gachaponRewards = [
  { value: 0, image: require("../../../assets/gachapon/0pt.gif"), color: "gray" },
  { value: 10, image: require("../../../assets/gachapon/10pt.gif"), color: "blue" },
  { value: 15, image: require("../../../assets/gachapon/15pt.gif"), color: "orange" },
  { value: 20, image: require("../../../assets/gachapon/20pt.gif"), color: "green" },
  { value: 30, image: require("../../../assets/gachapon/30pt.gif"), color: "red" },
  { value: 40, image: require("../../../assets/gachapon/40pt.gif"), color: "purple" },
  { value: 50, image: require("../../../assets/gachapon/50pt.gif"), color: "pink" },
  { value: 100, image: require("../../../assets/gachapon/100pt.gif"), color: "teal" },
];

const GachaponGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [gameState, setGameState] = useState("ready"); // ready, spinning, dispensed
  const [reward, setReward] = useState(null);

  const handleSpin = () => {
    if (gameState === "spinning") return;
    
    setGameState("spinning");

    // 1. Simulate the "Spinning" duration of the GachaponInsert.gif
    setTimeout(() => {
      // 2. Determine random reward
      const randomIndex = Math.floor(Math.random() * gachaponRewards.length);
      const selectedReward = gachaponRewards[randomIndex];
      
      setReward(selectedReward);
      setGameState("dispensed");

      // 3. Award points if not practice
      if (!isPracticeMode && selectedReward.value > 0) {
        onEarnPoints(selectedReward.value);
      }
    }, 3000); // Adjust this time to match the length of GachaponInsert.gif
  };

  const resetGame = () => {
    setGameState("ready");
    setReward(null);
  };

  return (
    <View style={appStyles.gameCard}>
      <Text style={appStyles.gameTitle}>Gachapon</Text>

      <View style={localStyles.machineContainer}>
        {/* PHASE 1: Ready to play */}
        {gameState === "ready" && (
          <Image source={require("../../../assets/gachapon/Gachapon.png")} style={localStyles.mainImage} />
        )}

        {/* PHASE 2: Coin inserted and handle cranking */}
        {gameState === "spinning" && (
          <Image source={require("../../../assets/gachapon/GachaponInsert.gif")} style={localStyles.mainImage} />
        )}

        {/* PHASE 3: Prize Dispensed */}
        {gameState === "dispensed" && reward && (
          <View style={localStyles.rewardContainer}>
            <Image source={reward.image} style={localStyles.prizeImage} />
            <Text style={localStyles.rewardText}>You got {reward.value} Points!</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={localStyles.controls}>
        {gameState === "ready" && (
          <TouchableOpacity style={appStyles.startButton} onPress={handleSpin}>
            <Text style={appStyles.startButtonText}>Insert Coin & Spin</Text>
          </TouchableOpacity>
        )}

        {gameState === "dispensed" && (
          <View style={localStyles.buttonRow}>
            <TouchableOpacity style={appStyles.secondaryButton} onPress={resetGame}>
              <RotateCcw size={16} color="#4b5563" />
              <Text style={appStyles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={appStyles.backToHubButton} onPress={onEndGame}>
              <Text style={appStyles.backToHubButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  machineContainer: {
    height: 400,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  rewardContainer: {
    alignItems: 'center',
  },
  prizeImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  rewardText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  }
});

export default GachaponGame;