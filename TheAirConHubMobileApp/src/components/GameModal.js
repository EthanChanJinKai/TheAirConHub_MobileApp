// src/components/GameModal.js

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Sparkles, X } from 'lucide-react-native';
import { styles } from '../styles/AppStyles';

const GameModal = ({ visible, onClose, onEarnPoints }) => {
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
      onEarnPoints(newScore);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.gameModalContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.gameContent}>
          <View style={styles.gameCard}>
            <Text style={styles.gameTitle}>Tap Challenge!</Text>
            <Text style={styles.gameSubtitle}>
              Tap the target 10 times to earn 100 points
            </Text>

            {!gameActive ? (
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
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

            {score > 0 && !gameActive && (
              <View style={styles.successMessage}>
                <Text style={styles.successText}>
                  +{score} points earned! 🎉
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GameModal;