import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Sparkles } from "lucide-react-native";
import { styles } from "../../styles/AppStyles";

const TapChallengeGame = ({ onEarnPoints, onEndGame, isPracticeMode }) => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });

  const startGame = () => {
    setScore(0);
    setGameActive(true);
    moveTarget();
  };

  const moveTarget = () => {
    setTargetPosition({
      x: Math.random() * 70 + 15,
      y: Math.random() * 50 + 15,
    });
  };

  const handleTargetPress = () => {
    const newScore = score + 10;
    setScore(newScore);
    moveTarget();

    if (newScore >= 100) {
      setGameActive(false);
      if (!isPracticeMode) {
        onEarnPoints(newScore);
      }
    }
  };

  return (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>Tap Challenge!</Text>
      <Text style={styles.gameSubtitle}>
        Tap the target 10 times to earn {isPracticeMode ? "no" : "100"} points
      </Text>

      {!gameActive ? (
        <>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>
              {isPracticeMode ? "Start Practice" : "Start Game"}
            </Text>
          </TouchableOpacity>
          {score > 0 && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>
                {isPracticeMode
                  ? "Practice Complete!"
                  : `+${score} points earned! 🎉`}
              </Text>
              <TouchableOpacity
                style={styles.backToHubButton}
                onPress={onEndGame}
              >
                <Text style={styles.backToHubButtonText}>Back to Games</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <View style={styles.gameArea}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score} pts</Text>
          </View>
          <TouchableOpacity
            onPress={handleTargetPress}
            style={[
              styles.target,
              {
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
              },
            ]}
          >
            <Sparkles size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TapChallengeGame;
