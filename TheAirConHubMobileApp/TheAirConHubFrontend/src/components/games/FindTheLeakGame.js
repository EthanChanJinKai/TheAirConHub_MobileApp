// src/components/games/FindTheLeakGame.js

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Search, CheckCircle, AlertCircle } from "lucide-react-native";
import { styles } from "../../styles/AppStyles";
import SineWaveDisplay from "./shared/SineWaveDisplay";
import RotatingKnob from "./shared/RotatingKnob";

const { width } = Dimensions.get("window");
const isDesktop = width >= 768;

const getResponsiveStyles = () => {
  if (isDesktop) {
    return {
      headerPadding: 6,
      headerFontSize: 18,
      sectionMargin: 8,
      controlsPadding: 12,
      knobWidth: "45%",
      buttonPaddingVertical: 10,
      buttonFontSize: 16,
      statusPadding: 8,
      titleFontSize: 16,
      knobBaseSize: 75,
      waveHeight: 90,
    };
  } else {
    return {
      headerPadding: 6,
      headerFontSize: 16,
      sectionMargin: 8,
      controlsPadding: 12,
      knobWidth: "48%",
      buttonPaddingVertical: 10,
      buttonFontSize: 14,
      statusPadding: 8,
      titleFontSize: 14,
      knobBaseSize: 70, // Smaller knob for mobile
      waveHeight: 80, // Shorter wave display for mobile
    };
  }
};
const GasTypes = {
  NATURAL_GAS: {
    name: "Natural Gas",
    element: "CH4",
    color: "#3b82f6",
    hazard: "High",
    repair: "Pipe seal + ventilation",
    frequency: 2.0,
    amplitude: 3.0,
  },
  PROPANE: {
    name: "Propane",
    element: "C3H8",
    color: "#f59e0b",
    hazard: "Critical",
    repair: "Tank replacement + valve",
    frequency: 3.5,
    amplitude: 2.5,
  },
  CARBON_MONOXIDE: {
    name: "Carbon Monoxide",
    element: "CO",
    color: "#ef4444",
    hazard: "Extreme",
    repair: "Source isolation + alarm",
    frequency: 1.5,
    amplitude: 4.0,
  },
  METHANE: {
    name: "Methane",
    element: "CH4",
    color: "#10b981",
    hazard: "Moderate",
    repair: "Leak patch + monitor",
    frequency: 2.8,
    amplitude: 3.5,
  },
};

const FindTheLeakGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const responsiveStyles = getResponsiveStyles();
  const [gameState, setGameState] = useState("ready");
  const [currentGas, setCurrentGas] = useState(null);
  const [userFrequency, setUserFrequency] = useState(2.0);
  const [userAmplitude, setUserAmplitude] = useState(3.0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [matchQuality, setMatchQuality] = useState(0);

  const gasArray = Object.values(GasTypes);
  const WINNING_SCORE = 100; // per round

  const calculateMatch = useCallback(() => {
    if (!currentGas) return 0;

    const freqDiff = Math.abs(currentGas.frequency - userFrequency);
    const ampDiff = Math.abs(currentGas.amplitude - userAmplitude);

    // Tolerance thresholds
    const freqTolerance = 0.2;
    const ampTolerance = 0.3;

    const freqMatch = Math.max(0, 100 - (freqDiff / freqTolerance) * 100);
    const ampMatch = Math.max(0, 100 - (ampDiff / ampTolerance) * 100);

    return Math.floor((freqMatch + ampMatch) / 2);
  }, [currentGas, userFrequency, userAmplitude]);

  useEffect(() => {
    if (gameState === "playing") {
      const quality = calculateMatch();
      setMatchQuality(quality);
    }
  }, [userFrequency, userAmplitude, currentGas, gameState, calculateMatch]);

  const startNewRound = () => {
    const target = gasArray[Math.floor(Math.random() * gasArray.length)];

    setCurrentGas(target);
    setUserFrequency(2.5); // Reset to a neutral starting point
    setUserAmplitude(3.5);
    setGameState("playing");
    setMatchQuality(0);
  };

  const handleLock = () => {
    if (gameState !== "playing") return;

    const quality = calculateMatch();

    if (quality >= 90) {
      setGameState("correct");

      // Calculate points
      let roundPoints = 0;
      if (round === 1) roundPoints = 10;
      else if (round === 2) roundPoints = 30;
      else if (round === 3) roundPoints = 50;

      setScore((s) => s + roundPoints);

      if (!isPracticeMode) {
        onEarnPoints(roundPoints);
      }

      // Wait for the overlay to show before changing rounds
      setTimeout(() => {
        if (round < 3) {
          setRound((prevRound) => prevRound + 1);
          // This resets currentGas for the NEXT round
          startNewRound();
        } else {
          setGameState("gameover");
        }
      }, 1500); // This matches your display time
    } else {
      setGameState("wrong");
      setTimeout(() => setGameState("playing"), 1000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setGameState("ready");
  };

  // --- RENDERING LOGIC ---

  if (gameState === "ready") {
    return (
      <View style={styles.gameCard}>
        <View style={styles.leakGameReadyContainer}>
          <Search size={50} color="#3B82F6" style={styles.leakGameIcon} />
          <Text style={styles.gameTitle}>Odor Signature Match</Text>
          <Text style={styles.gameSubtitle}>
            Calibrate your detector by matching the target waveform using the
            frequency and amplitude controls.
          </Text>
          <View style={styles.leakGameHowTo}>
            <Text style={styles.leakGameHowToTitle}>How to Play:</Text>
            <Text style={styles.leakGameHowToText}>
              • Rotate the knobs to adjust frequency and amplitude.
            </Text>
            <Text style={styles.leakGameHowToText}>
              • Match the target waveform exactly.
            </Text>
            <Text style={styles.leakGameHowToText}>
              • Lock in when match quality ≥ 90%.
            </Text>
            <Text style={styles.leakGameHowToText}>
              • Complete 3 rounds to finish.
            </Text>
          </View>
          <TouchableOpacity
            onPress={startNewRound}
            style={styles.leakGameStartButton}
          >
            <Text style={styles.leakGameStartButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Calibration"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === "gameover") {
    return (
      <View style={styles.gameCard}>
        <View style={styles.leakGameOverContainer}>
          <CheckCircle size={50} color="#10B981" style={styles.leakGameIcon} />
          <Text style={styles.gameTitle}>Calibration Complete</Text>
          <Text style={styles.leakGameFinalScore}>{score}</Text>
          <Text style={styles.gameSubtitle}>Final Score</Text>
          <TouchableOpacity
            onPress={resetGame}
            style={styles.leakGameStartButton}
          >
            <Text style={styles.leakGameStartButtonText}>New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backToHubButton, { marginTop: 10 }]}
            onPress={onEndGame}
          >
            <Text style={styles.backToHubButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active Game State
  const matchColor =
    matchQuality >= 90 ? "#10B981" : matchQuality >= 70 ? "#F59E0B" : "#EF4444";

  return (
    <View style={styles.gameCard}>
      {/* Header with responsive padding */}
      <View
        style={[
          styles.leakGameHeader,
          { padding: responsiveStyles.headerPadding },
        ]}
      >
        <View style={styles.leakGameHeaderItem}>
          <Text style={styles.leakGameHeaderLabel}>Round</Text>
          <Text
            style={[
              styles.leakGameHeaderValue,
              { fontSize: responsiveStyles.headerFontSize },
            ]}
          >
            {round}/{3}
          </Text>
        </View>
        <View style={styles.leakGameHeaderItem}>
          <Text style={styles.leakGameHeaderLabel}>Score</Text>
          <Text style={[styles.leakGameHeaderValue, { color: "#3B82F6" }]}>
            {score}
          </Text>
        </View>
        <View style={styles.leakGameHeaderItem}>
          <Text style={styles.leakGameHeaderLabel}>Match Quality</Text>
          <Text style={[styles.leakGameHeaderValue, { color: matchColor }]}>
            {matchQuality}%
          </Text>
        </View>
      </View>

      {/* Status Overlays */}
      {(gameState === "correct" || gameState === "wrong") && (
        <View
          style={[
            styles.overlayStyle,
            {
              // Transparent Green for correct, Transparent Red for wrong
              backgroundColor:
                gameState === "correct"
                  ? "rgba(16, 185, 129, 0.9)" // Increased opacity for "fill" effect
                  : "rgba(239, 68, 68, 0.9)",
              borderColor: gameState === "correct" ? "#10B981" : "#EF4444",
            },
          ]}
        >
          <View
            style={{
              padding: 24,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {gameState === "correct" ? (
              <CheckCircle size={64} color="white" /> // Larger icon
            ) : (
              <AlertCircle size={64} color="white" />
            )}

            <View style={{ alignItems: "center", marginTop: 16 }}>
              <Text
                style={[
                  styles.leakGameStatusTitle,
                  { color: "white", fontSize: 24 }, // Larger, white text
                ]}
              >
                {gameState === "correct"
                  ? "Perfect Match!"
                  : "Calibration Failed"}
              </Text>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  marginTop: 8,
                  fontSize: 16,
                }}
              >
                {gameState === "correct"
                  ? `\n${currentGas?.element || ""} \n${
                      currentGas?.name || "Gas"
                    } identified!\nPreparing next round...`
                  : "Match quality too low.\nAdjust frequency/amplitude."}
              </Text>
            </View>
          </View>
        </View>
      )}

      {gameState === "playing" && <View style={{ height: 10 }} />}

      {/* Target Waveform */}
      {currentGas && (
        <View
          style={[
            styles.leakGameSection,
            { marginBottom: responsiveStyles.sectionMargin },
          ]}
        >
          <SineWaveDisplay
            height={responsiveStyles.waveHeight} // Pass the height here
            frequency={currentGas.frequency}
            amplitude={currentGas.amplitude}
            color={currentGas.color}
            label={`TARGET: ${currentGas.name} Signature`}
            isTarget={true}
          />
        </View>
      )}

      {/* User Waveform */}
      <View
        style={[
          styles.leakGameSection,
          { marginBottom: responsiveStyles.sectionMargin },
        ]}
      >
        <SineWaveDisplay
          height={responsiveStyles.waveHeight} // Pass the height here
          frequency={userFrequency}
          amplitude={userAmplitude}
          color="#9ca3af"
          label="YOUR CALIBRATION"
          isTarget={false}
        />
      </View>

      {/* Rotating Knob Controls */}
      <View
        style={[
          styles.leakGameControlsContainer,
          { padding: responsiveStyles.controlsPadding },
        ]}
      >
        <Text
          style={[
            styles.leakGameControlsTitle,
            { fontSize: responsiveStyles.titleFontSize },
          ]}
        >
          Calibration Controls
        </Text>
        <View style={styles.leakGameKnobRow}>
          <View style={{ width: responsiveStyles.knobWidth }}>
            <RotatingKnob
              label="FREQUENCY"
              value={userFrequency}
              min={1.0}
              max={4.0}
              step={0.1}
              onChange={setUserFrequency}
              unit=" Hz"
            />
          </View>
          <View style={{ width: responsiveStyles.knobWidth }}>
            <RotatingKnob
              label="AMPLITUDE"
              value={userAmplitude}
              min={1.5}
              max={5.0}
              step={0.1}
              onChange={setUserAmplitude}
              unit=""
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLock}
          disabled={gameState !== "playing" || matchQuality < 90}
          style={[
            styles.leakGameLockButton,
            { paddingVertical: responsiveStyles.buttonPaddingVertical },
            matchQuality >= 90
              ? styles.leakGameLockButtonActive
              : styles.leakGameLockButtonInactive,
          ]}
        >
          <Text
            style={[
              styles.leakGameLockButtonText,
              { fontSize: responsiveStyles.buttonFontSize },
            ]}
          >
            {matchQuality >= 90
              ? "🔒 LOCK SIGNATURE"
              : `MATCH ${matchQuality}% (Need ≥90%)`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FindTheLeakGame;
