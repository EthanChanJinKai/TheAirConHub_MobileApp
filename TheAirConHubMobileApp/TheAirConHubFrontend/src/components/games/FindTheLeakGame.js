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
      headerPadding: 12,
      headerFontSize: 20,
      sectionMargin: 15,
      controlsPadding: 20,
      knobWidth: '45%',
      buttonPaddingVertical: 15,
      buttonFontSize: 18,
      statusPadding: 12,
      titleFontSize: 18,
      knobBaseSize: 90, // Explicit size for desktop
      waveHeight: 120, // Explicit height for desktop
    };
  } else {
    return {
      headerPadding: 6,
      headerFontSize: 16,
      sectionMargin: 8,
      controlsPadding: 12,
      knobWidth: '48%',
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
    color: "#3b82f6",
    hazard: "High",
    repair: "Pipe seal + ventilation",
    frequency: 2.0,
    amplitude: 3.0,
  },
  PROPANE: {
    name: "Propane",
    color: "#f59e0b",
    hazard: "Critical",
    repair: "Tank replacement + valve",
    frequency: 3.5,
    amplitude: 2.5,
  },
  CARBON_MONOXIDE: {
    name: "Carbon Monoxide",
    color: "#ef4444",
    hazard: "Extreme",
    repair: "Source isolation + alarm",
    frequency: 1.5,
    amplitude: 4.0,
  },
  METHANE: {
    name: "Methane",
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
      
      // --- NEW SCORING LOGIC ---
      // Round 1 = 10pts, Round 2 = 30pts, Round 3 = 50pts
      let roundPoints = 0;
      if (round === 1) roundPoints = 10;
      else if (round === 2) roundPoints = 30;
      else if (round === 3) roundPoints = 50;

      setScore((s) => s + roundPoints);

      if (!isPracticeMode) {
        onEarnPoints(roundPoints); // Send fixed points
      }
      // -------------------------

      setTimeout(() => {
        if (round < 3) {
          setRound(round + 1);
          startNewRound();
        } else {
          setGameState("gameover");
        }
      }, 1500);
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
      <View style={[
        styles.leakGameHeader,
        { padding: responsiveStyles.headerPadding }
      ]}>
        <View style={styles.leakGameHeaderItem}>
          <Text style={styles.leakGameHeaderLabel}>Round</Text>
          <Text style={[
            styles.leakGameHeaderValue,
            { fontSize: responsiveStyles.headerFontSize }
          ]}>
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

      {/* Status Messages */}
      {gameState === "correct" && (
        <View style={[
          styles.leakGameSuccessMessage,
          { 
            padding: responsiveStyles.statusPadding,
            marginBottom: responsiveStyles.sectionMargin 
          }
          ]}>
          <CheckCircle size={24} color="#A7F3D0" />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.leakGameStatusTitle}>Perfect Match!</Text>
            <Text style={styles.leakGameStatusText}>
              {currentGas.name} identified - {currentGas.hazard} Hazard -
              Repair: {currentGas.repair}
            </Text>
          </View>
        </View>
      )}

      {gameState === "wrong" && (
        <View style={styles.leakGameWarningMessage}>
          <AlertCircle size={24} color="#FCD34D" />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.leakGameStatusTitle}>
              Match Quality Too Low
            </Text>
            <Text style={styles.leakGameStatusText}>
              Need ≥90% match to lock in. Keep adjusting!
            </Text>
          </View>
        </View>
      )}

      {gameState === "playing" && (
        <View style={{ height: 10 }} /> 
      )}

      {/* Target Waveform */}
      {currentGas && (
        <View style={styles.leakGameSection}>
          <SineWaveDisplay
            frequency={currentGas.frequency}
            amplitude={currentGas.amplitude}
            color={currentGas.color}
            label={`TARGET: ${currentGas.name} Signature`}
            isTarget={true}
          />
        </View>
      )}

      {/* User Waveform */}
      <View style={styles.leakGameSection}>
        <SineWaveDisplay
          frequency={userFrequency}
          amplitude={userAmplitude}
          color="#9ca3af"
          label="YOUR CALIBRATION"
          isTarget={false}
        />
      </View>

      {/* Rotating Knob Controls */}
      <View style={[
        styles.leakGameControlsContainer,
        { padding: responsiveStyles.controlsPadding }
      ]}>
        <Text style={[
          styles.leakGameControlsTitle,
          { fontSize: responsiveStyles.titleFontSize }
        ]}>
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
          <Text style={[
            styles.leakGameLockButtonText,
            { fontSize: responsiveStyles.buttonFontSize }
          ]}>
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