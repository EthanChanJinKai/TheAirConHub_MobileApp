import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
  Dimensions,
  StyleSheet, // Required for localStyles
  TouchableOpacity, // Required for buttons
} from "react-native";
import { Sparkles, CheckCircle } from "lucide-react-native"; // Icons for Ready/Game Over screens

import dust from "../../../assets/tapchallenge/dust.png";
import dirt from "../../../assets/tapchallenge/dirt.png";
import evaporatorCoil from "../../../assets/tapchallenge/evaporator_coil.png";

// MODIFIED: Get screen width for responsiveness
const screenWidth = Dimensions.get("window").width;
// Use 1024px as a clear breakpoint for "laptop" or wide screens 
const isWideScreen = screenWidth >= 1024;

const mobileGameSize = Math.min(
  300, // Max size for mobile
  screenWidth * 0.95
);
const DYNAMIC_GAME_AREA_SIZE = isWideScreen ? 350 : mobileGameSize;

// MODIFIED: Define new, larger sprite sizes for easier tapping
const SPRITE_SIZE = {
  small: { width: 100, height: 100, offset: 40 },
  large: { width: 150, height: 150, offset: 55 },
};
const GAME_AREA_SIZE = DYNAMIC_GAME_AREA_SIZE;

// NEW: Accept props for game integration (even if not used here)
const CleanTheCoilGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [score, setScore] = useState(0);
  // MODIFIED: Use 'ready' state to manage game flow (ready, playing, gameover)
  const [gameState, setGameState] = useState("ready");
  const [dirtSpots, setDirtSpots] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [combo, setCombo] = useState(0);
  const [missedSpots, setMissedSpots] = useState(0);

  const gameTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const comboTimerRef = useRef(null);

  const BRONZE_THRESHOLD = 500;
  const SILVER_THRESHOLD = 850;
  const GOLD_THRESHOLD = 1000;

  // Helper to check if game is active
  const gameActive = gameState === "playing";

  const stopTimers = () => {
    clearTimeout(spawnTimerRef.current);
    clearTimeout(gameTimerRef.current);
    clearTimeout(comboTimerRef.current);
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }

    return () => clearTimeout(gameTimerRef.current);
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (gameActive) spawnDirt();
    return () => stopTimers();
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setDirtSpots([]);
    setCombo(0);
    setMissedSpots(0);
    setGameState("playing");
  };

  const endGame = () => {
    setGameState("gameover");
    stopTimers();
  };

  const finishGame = () => {
    stopTimers();
    if (!isPracticeMode && score > 0) {
      // Assuming onEarnPoints handles point submission
      onEarnPoints(score);
    }
    onEndGame(); // Call the external handler to exit the minigame
  };

  const spawnDirt = () => {
    const newDirt = {
      id: Date.now() + Math.random(),
      // Keep x between 10% and 90%
      x: Math.random() * 80 + 10,
      // Keep y between 10% and 90%
      y: Math.random() * 80 + 10,
      size: Math.random() > 0.75 ? "large" : "small",
      type: Math.random() > 0.5 ? "dust" : "dirt",
      lifetime: Math.random() > 0.6 ? 1800 : 1500,
    };

    setDirtSpots((prev) => [...prev, newDirt]);

    setTimeout(() => {
      setDirtSpots((prev) => {
        const exists = prev.find((s) => s.id === newDirt.id);
        if (exists) {
          setMissedSpots((m) => m + 1);
          setCombo(0);
        }
        return prev.filter((s) => s.id !== newDirt.id);
      });
    }, newDirt.lifetime);

    spawnTimerRef.current = setTimeout(spawnDirt, Math.random() * 500 + 250);
  };

  const cleanDirt = (spotId, size) => {
    if (!gameActive) return;

    setDirtSpots((prev) => prev.filter((s) => s.id !== spotId));

    const newCombo = combo + 1;
    setCombo(newCombo);

    const base = size === "large" ? 15 : 10;
    const multiplier = Math.floor(newCombo / 5) * 0.5 + 1;

    setScore((s) => s + Math.floor(base * multiplier));

    clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setCombo(0), 2000);
  };

  const getMedal = (finalScore) => {
    if (finalScore >= GOLD_THRESHOLD) return { icon: "🥇", name: "Gold" };
    if (finalScore >= SILVER_THRESHOLD) return { icon: "🥈", name: "Silver" };
    if (finalScore >= BRONZE_THRESHOLD) return { icon: "🥉", name: "Bronze" };
    return { icon: "😞", name: "Try Again" };
  };

  // --- RENDER LOGIC ---

  // 1. Ready Screen
  if (gameState === "ready") {
    return (
      <View style={localStyles.gameCard}>
        <View style={localStyles.coilGameReadyContainer}>
          <Sparkles
            size={50}
            color="#3B82F6"
            style={localStyles.coilGameIcon}
          />
          <Text style={localStyles.gameTitle}>Clean the Coil</Text>
          <Text style={localStyles.gameSubtitle}>
            Tap quickly to scrub the dirt and dust off the evaporator coil!
          </Text>

          <View style={localStyles.coilGameHowTo}>
            <Text style={localStyles.coilGameHowToTitle}>How to Play:</Text>
            <Text style={localStyles.coilGameHowToText}>
              • Tap all Dirt and Dust spots quickly.
            </Text>
            <Text style={localStyles.coilGameHowToText}>
              • The clock is ticking! 45 seconds to score as much as possible.
            </Text>
            <Text style={localStyles.coilGameHowToText}>
              • Build a Combo by tapping fast for bigger scores.
            </Text>
            <Text style={localStyles.coilGameHowToText}>
              • Don't miss! Missed spots reset your combo.
            </Text>
          </View>

          <TouchableOpacity
            onPress={startGame}
            style={localStyles.coilGameStartButton}
          >
            <Text style={localStyles.coilGameStartButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Cleaning"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. Game Over Screen
  if (gameState === "gameover") {
    const medal = getMedal(score);

    return (
      <View style={localStyles.gameCard}>
        <View style={localStyles.coilGameOverContainer}>
          <CheckCircle
            size={50}
            color={score >= BRONZE_THRESHOLD ? "#10B981" : "#EF4444"}
            style={localStyles.coilGameIcon}
          />
          <Text style={localStyles.gameTitle}>Game Over!</Text>

          <Text style={localStyles.gameSubtitle}>
            {isPracticeMode ? "Practice Complete" : `Final Score:`}
          </Text>
          <Text style={localStyles.coilGameFinalScore}>{score}</Text>
          <Text style={[localStyles.gameSubtitle, { marginBottom: 20 }]}>
            {medal.icon} {medal.name}
          </Text>

          <TouchableOpacity
            onPress={startGame}
            style={localStyles.coilGameStartButton}
          >
            <Text style={localStyles.coilGameStartButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.backToHubButton, { marginTop: 10 }]}
            onPress={finishGame}
          >
            <Text style={localStyles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Active Game Screen (gameState === 'playing')
  return (
    <ScrollView style={localStyles.scrollContainer}>
      <View style={localStyles.gameCard}>
        {/* Title */}
        <Text style={localStyles.gameTitle}>Clean the Coil</Text>

        {/* Score/Time Bar */}
        <View style={localStyles.scoreBar}>
          {/* Score Section */}
          <View style={localStyles.scoreBarItem}>
            <Text style={localStyles.scoreBarLabel}>Score</Text>
            <Text style={[localStyles.scoreBarValue, { color: "#4ADE80" }]}>
              {score}
            </Text>
          </View>

          {/* Combo Section */}
          <View style={localStyles.scoreBarItem}>
            <Text style={localStyles.scoreBarLabel}>Combo</Text>
            <Text style={[localStyles.scoreBarValue, { color: "#FBBF24" }]}>
              {combo > 0 ? `${combo}x` : "-"}
            </Text>
          </View>

          {/* Time Section */}
          <View style={localStyles.scoreBarItem}>
            <Text style={localStyles.scoreBarLabel}>Time</Text>
            <Text style={[localStyles.scoreBarValue, { color: "#60A5FA" }]}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Game Area */}
        <View style={localStyles.gameAreaWrapper}>
          <ImageBackground
            source={evaporatorCoil}
            style={localStyles.gameArea}
            resizeMode="stretch"
          >
            {dirtSpots.map((spot) => {
              const sizeData =
                spot.size === "large" ? SPRITE_SIZE.large : SPRITE_SIZE.small;

              return (
                <Pressable
                  key={spot.id}
                  onPress={() => cleanDirt(spot.id, spot.size)}
                  style={{
                    position: "absolute",
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    // Center the sprite
                    transform: [
                      { translateX: -sizeData.offset },
                      { translateY: -sizeData.offset },
                    ],
                    padding: 5,
                  }}
                >
                  <Image
                    source={spot.type === "dust" ? dust : dirt}
                    style={{
                      width: sizeData.width,
                      height: sizeData.height,
                    }}
                    resizeMode="contain"
                  />
                </Pressable>
              );
            })}
          </ImageBackground>
        </View>

        {/* Additional Info */}
        <Text
          style={[localStyles.gameSubtitle, { fontSize: 11, marginTop: 5 }]}
        >
          Missed spots: {missedSpots}
        </Text>
      </View>
    </ScrollView>
  );
};

// CONSOLIDATED: All styles are defined here.
const localStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 4,
  },

  // GameCard Style (previously localStyles.gameCard and appStyles.gameCard)
  gameCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: GAME_AREA_SIZE + 48, // Account for padding
  },

  // Ready/Game Over Styles (replacing appStyles.leakGame*)
  gameTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },
  gameSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  coilGameReadyContainer: {
    padding: 15,
    alignItems: "center",
  },
  coilGameIcon: {
    marginBottom: 15,
  },
  coilGameHowTo: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: "100%",
    alignSelf: "flex-start",
  },
  coilGameHowToTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#93C5FD",
    marginBottom: 5,
  },
  coilGameHowToText: {
    fontSize: 12,
    color: "#D1D5DB",
    lineHeight: 18,
  },
  coilGameStartButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
  },
  coilGameStartButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  coilGameOverContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  coilGameFinalScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#3B82F6",
    marginVertical: 10,
  },
  backToHubButton: {
    backgroundColor: "#6B7280",
    paddingVertical: 12,
    borderRadius: 10,
    width: "85%",
    alignSelf: "center", // Added alignSelf for consistency
    alignItems: "center",
  },
  backToHubButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Game Active Styles
  scoreBar: {
    width: GAME_AREA_SIZE,
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreBarItem: { alignItems: "center" },
  scoreBarLabel: { color: "#94A3B8", fontSize: 12, marginBottom: 2 },
  scoreBarValue: { fontSize: 20, fontWeight: "bold" },

  gameAreaWrapper: {
    width: GAME_AREA_SIZE,
    height: GAME_AREA_SIZE,
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 6,
    marginBottom: 22,
  },

  gameArea: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 12,
    overflow: "hidden",
  },

  medal: {
    fontSize: 48,
    fontWeight: "bold",
  },
});

export default CleanTheCoilGame;
