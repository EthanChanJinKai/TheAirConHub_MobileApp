// src/components/games/shared/pipeHelpers.js

// OPTION 1: If assets is at root level (most common)
import IPipe from "../../../../assets/ipipe.png";
import CrossPipe from "../../../../assets/crosspipe.png";
import LPipe from "../../../../assets/lpipe.png";

// OPTION 2: If you get an error with 4 levels, try 3:
// import IPipe from "../../../assets/ipipe.png";
// import CrossPipe from "../../../assets/crosspipe.png";
// import LPipe from "../../../assets/lpipe.png";

// OPTION 3: If assets is inside src folder:
// import IPipe from "../../../assets/ipipe.png";
// import CrossPipe from "../../../assets/crosspipe.png";
// import LPipe from "../../../assets/lpipe.png";

export const PIPE_TYPES = [
  {
    rotations: [0, 90],
    image: IPipe,
    style: { borderWidth: 0, borderTopWidth: 4, borderBottomWidth: 4 },
  }, // I-Pipe
  {
    rotations: [0, 90, 180, 270],
    image: CrossPipe,
    style: { borderWidth: 4 },
  }, // Cross-Pipe
  {
    rotations: [0, 90, 180, 270],
    image: LPipe,
    style: { borderTopWidth: 4, borderRightWidth: 4 },
  }, // L-Pipe (Corner)
];

export const GRID_SIZE = 4;
export const WINNING_SCORE = 50;
export const START_INDEX = 0; // Top-Left corner
export const END_INDEX = GRID_SIZE * GRID_SIZE - 1; // Bottom-Right corner

// Helper to check if a specific connection is active on a tile based on its rotation
export const hasConnection = (tile, direction) => {
  const rotation = tile.rotation % 360;
  const typeIndex = tile.typeIndex;

  // I-Pipe (index 0)
  if (typeIndex === 0) {
    if (rotation === 0 || rotation === 180) {
      const result = direction === "T" || direction === "B";
      console.log(`    I-Pipe (rot ${rotation}): ${direction} = ${result}`);
      return result;
    }
    if (rotation === 90 || rotation === 270) {
      const result = direction === "L" || direction === "R";
      console.log(`    I-Pipe (rot ${rotation}): ${direction} = ${result}`);
      return result;
    }
  }

  // Cross-Pipe (index 1)
  if (typeIndex === 1) {
    console.log(`    Cross-Pipe: ${direction} = true (all directions)`);
    return true;
  }

  // L-Pipe logic (index 2)
  if (typeIndex === 2) {
    let result = false;
    if (rotation === 0) result = direction === "T" || direction === "R";
    else if (rotation === 90) result = direction === "R" || direction === "B";
    else if (rotation === 180) result = direction === "B" || direction === "L";
    else if (rotation === 270) result = direction === "L" || direction === "T";
    console.log(`    L-Pipe (rot ${rotation}): ${direction} = ${result}`);
    return result;
  }

  console.log(`    Unknown pipe type ${typeIndex}: ${direction} = false`);
  return false;
};

// CORE PATHFINDING FUNCTION
export const isPathConnected = (currentGrid) => {
  const visited = new Array(currentGrid.length).fill(false);
  const queue = [START_INDEX];
  visited[START_INDEX] = true;

  console.log("=== PATHFINDING DEBUG ===");
  console.log("Starting pathfinding from index:", START_INDEX);
  console.log("Target end index:", END_INDEX);

  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const currentTile = currentGrid[currentIndex];

    console.log(`Checking tile ${currentIndex}:`, {
      typeIndex: currentTile.typeIndex,
      rotation: currentTile.rotation,
      row: Math.floor(currentIndex / GRID_SIZE),
      col: currentIndex % GRID_SIZE,
    });

    if (currentIndex === END_INDEX) {
      console.log("✅ PATH FOUND! Reached the end!");
      return true; // Path found!
    }

    const row = Math.floor(currentIndex / GRID_SIZE);
    const col = currentIndex % GRID_SIZE;

    const neighbors = [
      {
        index: currentIndex - GRID_SIZE,
        direction: "T",
        requiredNeighborConnection: "B",
      }, // Top
      {
        index: currentIndex + GRID_SIZE,
        direction: "B",
        requiredNeighborConnection: "T",
      }, // Bottom
      {
        index: currentIndex + 1,
        direction: "R",
        requiredNeighborConnection: "L",
      }, // Right
      {
        index: currentIndex - 1,
        direction: "L",
        requiredNeighborConnection: "R",
      }, // Left
    ];

    for (const {
      index: neighborIndex,
      direction,
      requiredNeighborConnection,
    } of neighbors) {
      // Check if neighbor index is valid (0 to 15)
      if (neighborIndex < 0 || neighborIndex >= currentGrid.length) {
        continue;
      }

      // Prevent horizontal wrapping
      if (direction === "R" && col === GRID_SIZE - 1) {
        continue;
      }
      if (direction === "L" && col === 0) {
        continue;
      }

      if (!visited[neighborIndex]) {
        const neighborTile = currentGrid[neighborIndex];
        const currentConnects = hasConnection(currentTile, direction);
        const neighborConnects = hasConnection(
          neighborTile,
          requiredNeighborConnection
        );

        console.log(`  Checking neighbor ${neighborIndex} (${direction}):`, {
          currentConnects,
          neighborConnects,
          neighborType: neighborTile.typeIndex,
          neighborRotation: neighborTile.rotation,
        });

        if (currentConnects && neighborConnects) {
          console.log(`  ✅ Connected to tile ${neighborIndex}`);
          visited[neighborIndex] = true;
          queue.push(neighborIndex);
        } else {
          console.log(`  ❌ Not connected to tile ${neighborIndex}`);
        }
      }
    }
  }

  console.log("❌ NO PATH FOUND");
  return false; // No path found
};

// Helper to create a SOLVABLE grid
export const createSolvableGrid = () => {
  const grid = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
    typeIndex: 0,
    rotation: 0,
  }));

  // Step 1: Create a guaranteed path from START to END
  const path = [];
  let current = START_INDEX;
  path.push(current);

  // Simple path algorithm: move right and down randomly
  while (current !== END_INDEX) {
    const row = Math.floor(current / GRID_SIZE);
    const col = current % GRID_SIZE;

    const canGoRight = col < GRID_SIZE - 1;
    const canGoDown = row < GRID_SIZE - 1;

    if (!canGoRight && !canGoDown) break; // Shouldn't happen

    let nextMove;
    if (!canGoRight) {
      nextMove = "down";
    } else if (!canGoDown) {
      nextMove = "right";
    } else {
      // Randomly choose
      nextMove = Math.random() < 0.5 ? "right" : "down";
    }

    if (nextMove === "right") {
      current = current + 1;
    } else {
      current = current + GRID_SIZE;
    }

    path.push(current);
  }

  // Step 2: Place correct pipes along the path
  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;

    const prevIndex = i > 0 ? path[i - 1] : null;
    const nextIndex = i < path.length - 1 ? path[i + 1] : null;

    // Determine which directions we need to connect
    let needsTop = false,
      needsBottom = false,
      needsLeft = false,
      needsRight = false;

    if (prevIndex !== null) {
      if (prevIndex === index - GRID_SIZE) needsTop = true;
      if (prevIndex === index + GRID_SIZE) needsBottom = true;
      if (prevIndex === index - 1) needsLeft = true;
      if (prevIndex === index + 1) needsRight = true;
    }

    if (nextIndex !== null) {
      if (nextIndex === index - GRID_SIZE) needsTop = true;
      if (nextIndex === index + GRID_SIZE) needsBottom = true;
      if (nextIndex === index - 1) needsLeft = true;
      if (nextIndex === index + 1) needsRight = true;
    }

    // Choose appropriate pipe type and rotation
    const connections = [needsTop, needsRight, needsBottom, needsLeft];
    const connectionCount = connections.filter((c) => c).length;

    if (connectionCount === 2) {
      // Check if straight or corner
      if ((needsTop && needsBottom) || (needsLeft && needsRight)) {
        // Straight pipe (I-Pipe)
        grid[index].typeIndex = 0;
        grid[index].rotation = needsTop && needsBottom ? 0 : 90;
      } else {
        // Corner pipe (L-Pipe)
        grid[index].typeIndex = 2;
        if (needsTop && needsRight) grid[index].rotation = 0;
        else if (needsRight && needsBottom) grid[index].rotation = 90;
        else if (needsBottom && needsLeft) grid[index].rotation = 180;
        else if (needsLeft && needsTop) grid[index].rotation = 270;
      }
    }
  }

  // Step 3: Fill remaining tiles with random pipes
  for (let i = 0; i < grid.length; i++) {
    if (!path.includes(i)) {
      const typeIndex = Math.floor(Math.random() * PIPE_TYPES.length);
      const type = PIPE_TYPES[typeIndex];
      grid[i].typeIndex = typeIndex;
      grid[i].rotation =
        type.rotations[Math.floor(Math.random() * type.rotations.length)];
    }
  }

  // Step 4: Scramble the path tiles (rotate them randomly but not to correct position)
  for (let i = 0; i < path.length; i++) {
    const index = path[i];
    // Skip START and END tiles - we'll set those separately
    if (index === START_INDEX || index === END_INDEX) continue;

    const type = PIPE_TYPES[grid[index].typeIndex];
    const correctRotation = grid[index].rotation;

    // Get other possible rotations (not the correct one)
    const otherRotations = type.rotations.filter((r) => r !== correctRotation);
    if (otherRotations.length > 0) {
      grid[index].rotation =
        otherRotations[Math.floor(Math.random() * otherRotations.length)];
    }
  }

  return grid;
};

// Helper to create a grid, but ensuring the start/end tiles are visually distinct
export const createInitialGridWithStartEnd = () => {
  const grid = createSolvableGrid();

  // Set Start tile as Cross-Pipe (connects in all directions)
  grid[START_INDEX].typeIndex = 1; // Cross-Pipe
  grid[START_INDEX].rotation = 0; // Rotation doesn't matter for cross pipe

  // Set End tile as Cross-Pipe (connects in all directions)
  grid[END_INDEX].typeIndex = 1; // Cross-Pipe
  grid[END_INDEX].rotation = 0; // Rotation doesn't matter for cross pipe

  return grid;
};