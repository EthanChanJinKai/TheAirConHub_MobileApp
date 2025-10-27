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
    // Reset active game when modal becomes visible or initial key changes
    if (visible) {
      setActiveGameKey(null); // Always start at the hub
      setCurrentSlotKey(initialGameKey); // Set the current slot context
    } else {
      // Reset when modal closes
      setActiveGameKey(null);
      setCurrentSlotKey(null);
    }
  }, [visible, initialGameKey]);


  const handleEndGame = () => {
     // Go back to the hub after a game ends
    setActiveGameKey(null);
  }

  const handleSelectGame = (gameKey) => {
    // Set the selected game as active
    setActiveGameKey(gameKey);
  }

  const handleEarnPointsInGame = (points) => {
    // Pass earned points up, including the slot key context
    onEarnPoints(points, currentSlotKey);
  }

  const renderActiveGameComponent = () => {
    const isPracticeMode = currentSlotKey === "practice";

    switch (activeGameKey) {
      case "tap":
        return (
          <TapChallengeGame
            onEarnPoints={handleEarnPointsInGame}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "sequence":
        return (
          <BrokenPipelineGame
            onEarnPoints={handleEarnPointsInGame}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "leak":
        return (
          <FindTheLeakGame
            onEarnPoints={handleEarnPointsInGame}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "block":
        return (
          <BlockTheHazeGame
            onEarnPoints={handleEarnPointsInGame}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      case "wheel":
        return (
          <WheelOfFortuneGame
            onEarnPoints={handleEarnPointsInGame}
            onEndGame={handleEndGame}
            isPracticeMode={isPracticeMode}
          />
        );
      default: // null activeGameKey means show the Hub
        return (
          <GameHubScreen
            games={minigames}
            onSelectGame={handleSelectGame} // Use the new handler
            currentSlotKey={currentSlotKey}
          />
        );
    }
  };

  // Determine if the currently rendered component needs the ScrollView wrapper.
  // GameHubScreen uses FlatList, so it doesn't need the ScrollView.
  // Assume individual game components might need it if their content overflows.
  const needsScrollView = activeGameKey !== null; 

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.gameModalContainer}>
        <View style={styles.gameHeader}>
          {/* Back button logic: If in a game, go back to Hub, otherwise close Modal */}
          <TouchableOpacity
            onPress={activeGameKey ? handleEndGame : onClose} 
            style={styles.closeButton}
          >
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* --- Conditional ScrollView --- */}
        {needsScrollView ? (
          <ScrollView 
            contentContainerStyle={styles.gameContent} 
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled" // Good practice for ScrollViews with inputs
          >
            {renderActiveGameComponent()}
          </ScrollView>
        ) : (
          // If no ScrollView is needed (i.e., GameHubScreen), render directly.
          // Apply similar styling/flex properties as ScrollView's content container if needed.
           <View style={styles.gameContent}> 
             {renderActiveGameComponent()}
           </View>
        )}
      </View>
    </Modal>
  );
};

export default GameModal;
