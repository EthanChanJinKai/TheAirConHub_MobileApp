import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { styles } from "../../styles/AppStyles";

const GameHubScreen = ({ games, onSelectGame, currentSlotKey }) => {
  const isPracticeMode = currentSlotKey === "practice";

  const renderGameGridItem = ({ item: game }) => (
    <TouchableOpacity
      key={game.key}
      style={styles.gameGridItem}
      onPress={() => onSelectGame(game.key)}
    >
      <View style={styles.gameGridImagePlaceholder}>{game.iconComponent}</View>
      <Text style={styles.gameGridTitle}>{game.name}</Text>
      <Text style={styles.gameGridPoints}>
        {isPracticeMode ? "Practice" : game.bonus}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.gameHubList}>
      <Text style={styles.gameHubTitle}>Choose Your Challenge</Text>
      <Text style={styles.gameHubSubtitle}>
        {isPracticeMode
          ? "Play for fun (no points)"
          : "Play to earn bonus rewards!"}
      </Text>

      <FlatList
        data={games}
        renderItem={renderGameGridItem}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={styles.gameGridRow}
        contentContainerStyle={styles.gameGridContainer}
      />
    </View>
  );
};

export default GameHubScreen;
