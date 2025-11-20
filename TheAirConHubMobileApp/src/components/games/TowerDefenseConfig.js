import React from 'react';
import {Wind, Bug} from 'lucide-react-native';

const gameAssets = {
    //Game Map
    map: require('../../../assets/towerDefense/hvac.jpg'),

    //Tower Sprites 
    wallmounted: require('../../../assets/towerDefense/tower_wallmounted.gif'),
    //portable: require('../../../assets/towerDefense/tower_portable.gif'),
    casette: require('../../../assets/towerDefense/tower_cassette.gif'),
    floor: require('../../../assets/towerDefense/tower_floor.gif'),

    //Enemy Spritess
    virus: require('../../../assets/towerDefense/enemy_virus.gif'),
    heat: require('../../../assets/towerDefense/enemy_heat.gif'),
    dust: require('../../../assets/towerDefense/enemy_dust.gif'),
}

export const GAME_MAP = gameAssets.map;

export const TOWER_CONFIG = {
    wallmountedtower: {
        cost: 100,
        range: 100,
        damage: 50,
        fireRate: 1000,
        size: 50,
        icon: (color) => <Wind size={24} color={color} />,
        sprite: gameAssets.wallmounted,
    },

    casettetower: {
        cost: 300,
        range: 150,
        damage: 110,
        fireRate: 3000,
        size: 80,
        icon: (color) => <Wind size={24} color={color} />,
        sprite: gameAssets.casette,
    },

    floortower: {
        cost: 100,
        range: 200,
        damage: 25,
        fireRate: 750,
        size: 70,
        icon: (color) => <Wind size={24} color={color} />,
        sprite: gameAssets.floor,
    }
}

export const ENEMY_CONFIG = {
    virusenemy: {
        health: 200,
        speed: 2,
        money: 5,
        size: 40,
        icon: (color) => <Bug size={18} color={color} />, // Fallback
        sprite: gameAssets.virus,
    },
    heatenemy: {
        health: 350,
        speed: 1.5,
        money: 10,
        size: 50,
        icon: (color) => <Bug size={18} color={color} />, // Fallback
        sprite: gameAssets.heat,
    },
    dustenemy: {
        health: 150,
        speed: 3,
        money: 3,
        size: 30,
        icon: (color) => <Bug size={18} color={color} />, // Fallback
        sprite: gameAssets.dust,
    }
}