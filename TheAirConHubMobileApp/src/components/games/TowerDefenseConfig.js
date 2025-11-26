import React from "react";
import { Wind, Bug } from "lucide-react-native";
import { Dimensions } from "react-native";


// --- GAME SETTINGS ---
export const GAME_SETTINGS = {
  STARTING_HEALTH: 3,
  STARTING_MONEY: 300,
  INITIAL_PREP_TIME: 15, // Seconds before Wave 1
  WAVE_PREP_TIME: 10,    // Seconds between waves
  MAX_WAVES: 5,
};

const gameAssets = {
  //Game Map
  map: require("../../../assets/towerDefense/hvac.jpg"),

  //Tower Sprites
  wallmounted: require("../../../assets/towerDefense/tower_wallmounted.gif"),
  portable: require('../../../assets/towerDefense/tower_portable.gif'),
  casette: require("../../../assets/towerDefense/tower_cassette.gif"),
  floor: require("../../../assets/towerDefense/tower_floor.gif"),

  //Projectile Spritess
  projectile_wallmounted: require("../../../assets/towerDefense/normal_bullet.png"),
  projectile_casette: require("../../../assets/towerDefense/splash_bullet.png"),
  projectile_floor: require("../../../assets/towerDefense/ice_spike.gif"),
  projectile_portable: require("../../../assets/towerDefense/explosion.gif"),

  //Enemy Sprites
  virus: require("../../../assets/towerDefense/enemy_virus.gif"),
  heat: require("../../../assets/towerDefense/enemy_heat.gif"),
  dust: require("../../../assets/towerDefense/enemy_dust.gif"),
};

export const GAME_MAP = gameAssets.map;




// --- WAVE CONFIGURATION ---
export const WAVE_CONFIG = [
  // Wave 1
  { count: 5,  hpBonus: 10, types: ["virusenemy"] },
  // Wave 2
  { count: 10, hpBonus: 20, types: ["virusenemy", "heatenemy"] },
  // Wave 3 (Heat introduced)
  { count: 15, hpBonus: 30, types: ["virusenemy", "heatenemy"] }, 
  // Wave 4
  { count: 20, hpBonus: 40, types: ["virusenemy", "heatenemy", "dustenemy"] },
  // Wave 5 (Dust introduced)
  { count: 25, hpBonus: 50, types: ["virusenemy", "heatenemy", "dustenemy"] }, 
];

export const TOWER_CONFIG = {
  wallmountedtower: {
    cost: 100,
    range: 100,
    damage: 50,
    fireRate: 1000,
    size: 50,
    icon: (color) => <Wind size={24} color={color} />,
    sprite: gameAssets.wallmounted,
    projectileSprite: gameAssets.projectile_wallmounted,
  },

  portabletower: {
    cost: 250,        // Expensive
    range: 180,       // Long range
    damage: 150,      // High damage
    fireRate: 4000,   // Very slow fire rate
    size: 60,
    splashRadius: 80, // Big Area of Effect
    icon: (color) => <Wind size={24} color={color} />,
    sprite: gameAssets.portable,
    projectileSprite: gameAssets.projectile_portable,
  },

  casettetower: {
    cost: 300,
    range: 120,
    damage: 110,
    fireRate: 3000,
    size: 80,
    splashRadius: 50,
    icon: (color) => <Wind size={24} color={color} />,
    sprite: gameAssets.casette,
    projectileSprite: gameAssets.projectile_casette,
  },

  floortower: {
    cost: 150,
    range: 100,
    damage: 15,
    fireRate: 750,
    size: 70,
    aoeDamage: 15, // <--- new
    aoeTickRate: 1000,
    icon: (color) => <Wind size={24} color={color} />,
    sprite: gameAssets.floor,
    projectileSprite: gameAssets.projectile_floor,  
  },
};

export const ENEMY_CONFIG = {
  virusenemy: {
    health: 200,
    speed: 40,
    money: 10,
    size: 40,
    icon: (color) => <Bug size={18} color={color} />, // Fallback
    sprite: gameAssets.virus,
  },
  heatenemy: {
    health: 350,
    speed: 30,
    money: 25,
    size: 50,
    icon: (color) => <Bug size={18} color={color} />, // Fallback
    sprite: gameAssets.heat,
  },
  dustenemy: {
    health: 150,
    speed: 60,
    money: 10,
    size: 30,
    icon: (color) => <Bug size={18} color={color} />, // Fallback
    sprite: gameAssets.dust,
  },
};
