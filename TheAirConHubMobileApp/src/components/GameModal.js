import React, { useState, useEffect } from "react";
import { View, Modal, ScrollView, TouchableOpacity } from "react-native";
import { X, Sparkles, Dices, Wrench, Search, CloudOff } from "lucide-react-native";
import { styles } from "../styles/AppStyles";

// Import all game components
import TapChallengeGame from "./games/TapChallengeGame";
import BrokenPipelineGame from "./games/BrokenPipelineGame";
import FindTheLeakGame from "./games/FindTheLeakGame";
import BlockTheHazeGame from "./games/BlockTheHazeGame";
import WheelOfFortuneGame from "./games/WheelOfFortuneGame";
import GameHubScreen from "./games/GameHubScreen";

const GameModal = ({ visible, onClose, onEarnPoints, initialGameKey }) => {
  const [activeGameKey, setActiveGameKey] = useState(initialGameKey || null);
  const [currentSlotKey, setCurrentSlotKey] = useState(initialGameKey || null);

  // Game definitions with icons
  const minigames = [
    {
      name: "Wheel of Fortune",
      key: "wheel",
      bonus: "+25 Points",
      iconComponent: <Dices size={40} color="#3B82F6" />,
    },
    {
      name: "Broken Pipeline",
      key: "sequence",
      bonus: "+50 Points",
      iconComponent: <Wrench size={40} color="#3B82F6" />,
    },
    {
      name: "Find the Leak",
      key: "leak",
      bonus: "+50 Points",
      iconComponent: <Search size={40} color="#3B82F6" />,
    },
    {
      name: "Block the Haze",
      key: "block",
      bonus: "+50 Points",
      iconComponent: <CloudOff size={40} color="#3B82F6" />,
    },
    {
      name: "Quick Tap Challenge",
      key: "tap",
      bonus: "+100 Points",
      iconComponent: <Sparkles size={40} color="#3B82F6" />,
    },
  ];

  useEffect(() => {
    if (visible) {
      setActiveGameKey(null);
      setCurrentSlotKey(initialGameKey);
    } else {
      setCurrentSlotKey(null);
    }
  }, [visible, initialGameKey]);

  const renderActiveGame = () => {
    const handleEndGame = () => setActiveGameKey(null);
    const isPracticeMode = currentSlotKey === "practice";

    switch (activeGameKey) {
      case "tap":
        return (
          <TapChallengeGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "sequence":
        return (
          <BrokenPipelineGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "leak":
        return (
          <FindTheLeakGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "block":
        return (
          <BlockTheHazeGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "wheel":
        return (
          <WheelOfFortuneGame
            onEarnPoints={(points) => onEarnPoints(points, currentSlotKey)}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      default:
        return (
          <GameHubScreen
            games={minigames}
            onSelectGame={setActiveGameKey}
            currentSlotKey={currentSlotKey}
          />
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.gameModalContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity
            onPress={activeGameKey ? () => setActiveGameKey(null) : onClose}
            style={styles.closeButton}
          >
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.gameContent} showsVerticalScrollIndicator={true}>
          {renderActiveGame()}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GameModal;
