import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ImageBackground,
  ScrollView,
  Dimensions, // Added Dimensions
} from "react-native";

import dust from "../../../assets/tapchallenge/dust.png";
import dirt from "../../../assets/tapchallenge/dirt.png";
import evaporatorCoil from "../../../assets/tapchallenge/evaporator_coil.png";

// MODIFIED: Get screen width for responsiveness
const screenWidth = Dimensions.get("window").width;
// Use 1024px as a clear breakpoint for "laptop" or wide screens
const isWideScreen = screenWidth >= 1024; 

// MODIFIED: Define new, larger sprite sizes for easier tapping
const SPRITE_SIZE = {
    small: { width: 50, height: 50, offset: 25 },
    large: { width: 70, height: 70, offset: 35 },
};


const styles = {
  gameCard: {
    width: "98%", 
    // MODIFIED: Increased max width to allow a very wide container for laptops
    maxWidth: 1600, 
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
    marginTop: 20,
    marginBottom: 40,
  },

  scoreBar: {
    width: "100%",
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  gameAreaWrapper: {
    // MODIFIED: Always take 100% width of the card, filling the screen on laptops
    width: "100%", 
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 6,
    marginBottom: 22,
  },

  gameArea: {
    width: "100%",
    // MODIFIED: Reduced height for wide screens (350px) to create a landscape (wider) aspect ratio
    height: isWideScreen ? 350 : 480, 
    backgroundColor: "#0F172A",
    borderRadius: 18,
    overflow: "hidden",
  },

  startButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 15,
  },

  startButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  tryAgainButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 22,
  },

  tryAgainText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
};

const CleanTheCoilGame = () => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [dirtSpots, setDirtSpots] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [missedSpots, setMissedSpots] = useState(0);

  const gameTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const comboTimerRef = useRef(null);

  const BRONZE_THRESHOLD = 500;
  const SILVER_THRESHOLD = 850;
  const GOLD_THRESHOLD = 1000;

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
    return () => clearTimeout(spawnTimerRef.current);
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setDirtSpots([]);
    setCombo(0);
    setMissedSpots(0);
    setGameOver(false);
    setGameActive(true);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    clearTimeout(spawnTimerRef.current);
    clearTimeout(gameTimerRef.current);
  };

  const spawnDirt = () => {
    
    const newDirt = {
      id: Date.now() + Math.random(),
      // MODIFIED: Adjusted X-coordinate range (10% to 90%) to utilize the full, wider area
      x: Math.random() * 80 + 10, 
      // Y range adjusted for the shorter height
      y: Math.random() * 75 + 10, 
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
    if (finalScore >= GOLD_THRESHOLD)
      return { icon: "🥇", name: "Gold" };
    if (finalScore >= SILVER_THRESHOLD)
      return { icon: "🥈", name: "Silver" };
    if (finalScore >= BRONZE_THRESHOLD)
      return { icon: "🥉", name: "Bronze" };
    return { icon: "🙁", name: "Try Again" };
  };

  return (
    <ScrollView className="flex-1 bg-[#2563EB] p-4">
      <View style={styles.gameCard}>
        <Text className="text-4xl font-bold text-slate-800 text-center mb-4">
          Clean the Coil!
        </Text>

        {gameActive && (
          <View style={styles.scoreBar}>
            <View>
              <Text className="text-slate-300 text-xs">Score</Text>
              <Text className="text-green-400 text-xl font-bold">{score}</Text>
            </View>

            <View>
              <Text className="text-slate-300 text-xs">Combo</Text>
              <Text className="text-orange-400 text-xl font-bold">
                {combo > 0 ? `${combo}x` : "-"}
              </Text>
            </View>

            <View>
              <Text className="text-slate-300 text-xs">Time</Text>
              <Text className="text-blue-400 text-xl font-bold">{timeLeft}s</Text>
            </View>
          </View>
        )}

        <View style={styles.gameAreaWrapper}>
          <ImageBackground
            source={evaporatorCoil}
            style={styles.gameArea}
            resizeMode="cover"
          >
            {dirtSpots.map((spot) => {
              const sizeData = spot.size === "large" ? SPRITE_SIZE.large : SPRITE_SIZE.small;

              return (
                <Pressable
                  key={spot.id}
                  onPress={() => cleanDirt(spot.id, spot.size)}
                  style={{
                    position: "absolute",
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    // MODIFIED: Center the larger sprite using the offset
                    transform: [{ translateX: -sizeData.offset }, { translateY: -sizeData.offset }],
                    // MODIFIED: Add padding to make the pressable area bigger than the image
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

        {!gameActive && !gameOver && (
          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Cleaning</Text>
          </Pressable>
        )}

        {gameOver && (
          <View className="items-center">
            <Text className="text-6xl">{getMedal(score).icon}</Text>
            <Text className="text-slate-800 text-4xl font-bold mt-4">
              {score} Points
            </Text>

            <Pressable style={styles.tryAgainButton} onPress={startGame}>
              <Text style={styles.tryAgainText}>Try Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CleanTheCoilGame;