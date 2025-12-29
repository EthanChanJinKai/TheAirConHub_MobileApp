import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Dimensions
} from "react-native";

const screenWidth = Dimensions.get("window").width;
const GAME_AREA_SIZE = screenWidth >= 1024 ? 350 : Math.min(300, screenWidth * 0.95);

const gachaponRewards = [
  { value: 0, color: "#6b7280" },
  { value: 10, color: "#3b82f6" },
  { value: 15, color: "#f97316" },
  { value: 20, color: "#22c55e" },
  { value: 30, color: "#ef4444" },
  { value: 40, color: "#a855f7" },
  { value: 50, color: "#ec4899" },
  { value: 100, color: "#14b8a6" },
];

const GachaponGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [gameState, setGameState] = useState("ready");
  const [reward, setReward] = useState(null);
  const [playCount, setPlayCount] = useState(0); 
  
  const knobRotation = useRef(new Animated.Value(0)).current;

  const handleSpin = () => {
    if (gameState !== "ready") return;
    setPlayCount(prev => prev + 1);
    setGameState("inserting");

    setTimeout(() => {
      setGameState("cranking");
      
      Animated.timing(knobRotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setGameState("opening");
        const selectedReward = gachaponRewards[Math.floor(Math.random() * gachaponRewards.length)];
        
        setTimeout(() => {
          setReward(selectedReward);
          setGameState("dispensed");
          if (!isPracticeMode && selectedReward.value > 0) {
            onEarnPoints(selectedReward.value);
          }
        }, 1500);
      });
    }, 2000); 
  };

  const resetGame = () => {
    knobRotation.setValue(0);
    setReward(null);
    setGameState("ready");
  };

  const rotation = knobRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  return (
    <View style={localStyles.gameCard}>
      <Text style={localStyles.gameTitle}>Gachapon</Text>
      <Text style={localStyles.gameSubtitle}>
        {gameState === "dispensed" ? "You won a prize!" : "Test your luck for bonus points!"}
      </Text>

      <View style={localStyles.cropContainer}>
        <View style={localStyles.machineWrapper}>
          {/* MODIFIED: Gachapon.png is now hidden during 'dispensed' state */}
          {(gameState === "ready" || gameState === "cranking") && (
            <Image
              source={require("../../../assets/gachapon/Gachapon.png")}
              style={localStyles.mainImage}
            />
          )}

          {gameState === "cranking" && (
            <Animated.Image
              source={require("../../../assets/gachapon/Gachapon Knob.png")}
              style={[localStyles.knobImage, { transform: [{ rotate: rotation }] }]}
            />
          )}

          {gameState === "inserting" && (
            <Image
              key={`coin-${playCount}`}
              source={require("../../../assets/gachapon/Coin Insert.gif")}
              style={localStyles.mainImage}
            />
          )}

          {gameState === "opening" && (
            <Image
              key={`latch-${playCount}`}
              source={require("../../../assets/gachapon/Latch Open.gif")}
              style={localStyles.mainImage}
            />
          )}

          {/* Reward shown alone when dispensed */}
          {gameState === "dispensed" && reward && (
            <View style={localStyles.rewardOverlay}>
              <View style={[localStyles.pixelBox, { borderColor: reward.color }]}>
                <Text style={[localStyles.pixelText, { color: reward.color }]}>
                  {reward.value}
                </Text>
                <Text style={[localStyles.pixelSubText, { color: reward.color }]}>
                  POINTS
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={localStyles.controls}>
        {gameState === "ready" ? (
          <TouchableOpacity 
            style={localStyles.coilGameStartButton} 
            onPress={handleSpin}
          >
            <Text style={localStyles.coilGameStartButtonText}>Insert Coin & Spin</Text>
          </TouchableOpacity>
        ) : gameState === "dispensed" ? (
          <View style={localStyles.buttonColumn}>
            <TouchableOpacity 
              style={localStyles.coilGameStartButton} 
              onPress={resetGame}
            >
              <Text style={localStyles.coilGameStartButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={localStyles.backToHubButton} 
              onPress={onEndGame}
            >
              <Text style={localStyles.backToHubButtonText}>Back to Games</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ height: 50 }} /> 
        )}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  gameCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: GAME_AREA_SIZE + 48,
    alignItems: 'center',
    alignSelf: 'center',
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 5,
  },
  gameSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 10,
  },
  cropContainer: {
    height: 350,
    width: "100%",
    overflow: 'hidden',
    alignItems: 'center',
  },
  machineWrapper: {
    marginTop: -30,
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  mainImage: {
    width: 420,
    height: 420,
    resizeMode: "contain",
  },
  knobImage: {
    position: 'absolute',
    width: 60,   
    height: 60,
    top: 295, 
    zIndex: 10,
    resizeMode: "contain",
  },
  rewardOverlay: {
    alignItems: "center",
    justifyContent: "center",
  },
  pixelBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 4,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  pixelText: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    lineHeight: 72,
  },
  pixelSubText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30, // Button is pushed lower here
  },
  buttonColumn: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  coilGameStartButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "85%",
  },
  coilGameStartButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  backToHubButton: {
    backgroundColor: "#6B7280",
    paddingVertical: 12,
    borderRadius: 8,
    width: "85%",
    alignItems: "center",
  },
  backToHubButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GachaponGame;