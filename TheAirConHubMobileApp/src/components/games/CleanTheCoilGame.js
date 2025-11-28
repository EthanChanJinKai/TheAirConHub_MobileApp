import React, { useState, useEffect, useRef } from "react";
import { Droplets, Clock, Trophy } from "lucide-react-native";

import dust from "../../../assets/tapchallenge/dust.png";
import dirt from "../../../assets/tapchallenge/dirt.png";
import evaporatorCoil from "../../../assets/tapchallenge/evaporator_coil.png";

const CleanTheCoilGame = () => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [dirtSpots, setDirtSpots] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [missedSpots, setMissedSpots] = useState(0);
  const gameTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const comboTimerRef = useRef(null);

  // Medal thresholds - Gold is VERY hard to achieve
  const BRONZE_THRESHOLD = 500;
  const SILVER_THRESHOLD = 850;
  const GOLD_THRESHOLD = 1000;

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }

    return () => {
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    };
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (gameActive) {
      spawnDirt();
    }

    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setGameActive(true);
    setTimeLeft(45);
    setDirtSpots([]);
    setGameOver(false);
    setCombo(0);
    setMissedSpots(0);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
  };

  const spawnDirt = () => {
    const newDirt = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 5,
      y: Math.random() * 75 + 10,
      size: Math.random() > 0.7 ? "large" : "small", // Fewer large spots
      type: Math.random() > 0.5 ? "dust" : "dirt",
      lifetime: Math.random() > 0.6 ? 1800 : 1500, // Faster disappear times
    };

    setDirtSpots((prev) => [...prev, newDirt]);

    setTimeout(() => {
      setDirtSpots((prev) => {
        const stillExists = prev.find((s) => s.id === newDirt.id);
        if (stillExists) {
          setMissedSpots((m) => m + 1);
          setCombo(0); // Break combo on miss
        }
        return prev.filter((spot) => spot.id !== newDirt.id);
      });
    }, newDirt.lifetime);

    // Faster spawn rate for increased difficulty
    const delay = Math.random() * 500 + 250;
    spawnTimerRef.current = setTimeout(spawnDirt, delay);
  };

  const cleanDirt = (spotId, size) => {
    setDirtSpots((prev) => prev.filter((spot) => spot.id !== spotId));

    // Build combo system
    const newCombo = combo + 1;
    setCombo(newCombo);

    // Base points with combo multiplier
    const basePoints = size === "large" ? 15 : 10;
    const comboMultiplier = Math.floor(newCombo / 5) * 0.5 + 1; // +0.5x every 5 hits
    const points = Math.floor(basePoints * comboMultiplier);

    setScore((prev) => prev + points);

    // Reset combo timer
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000);
  };

  const getMedal = (finalScore) => {
    if (finalScore >= GOLD_THRESHOLD)
      return {
        name: "GOLD",
        color: "text-yellow-400",
        icon: "🥇",
        bg: "bg-yellow-900/30",
      };
    if (finalScore >= SILVER_THRESHOLD)
      return {
        name: "SILVER",
        color: "text-slate-300",
        icon: "🥈",
        bg: "bg-slate-700/50",
      };
    if (finalScore >= BRONZE_THRESHOLD)
      return {
        name: "BRONZE",
        color: "text-amber-600",
        icon: "🥉",
        bg: "bg-amber-900/30",
      };
    return {
      name: "TRY AGAIN",
      color: "text-slate-500",
      icon: "😓",
      bg: "bg-slate-800/50",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Droplets className="text-blue-400" size={40} />
            Clean the Coil!
            <Droplets className="text-blue-400" size={40} />
          </h1>
          <p className="text-slate-400 text-lg">
            Tap the dirt and dust spots to clean the evaporator coil!
          </p>
        </div>

        {!gameActive && !gameOver && (
          <div className="text-center py-12">
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-12 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Start Cleaning
            </button>
            <div className="mt-8 text-slate-400 space-y-2">
              <p className="text-lg font-semibold text-white mb-3">
                How to Play:
              </p>
              <p>🎯 Large spots = 15 points | 💧 Small spots = 10 points</p>
              <p>🔥 Build combos for multipliers! (+0.5x every 5 hits)</p>
              <p>⚡ Spots disappear in 1.5-1.8 seconds - be quick!</p>
              <p className="mt-4">⏱️ You have 45 seconds to prove yourself!</p>
              <div className="mt-6 bg-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-300">
                  🥉 Bronze: 500+ | 🥈 Silver: 850+ | 🥇 Gold: 1000+ (Nearly
                  Impossible!)
                </p>
              </div>
            </div>
          </div>
        )}

        {gameActive && (
          <>
            <div className="flex justify-between items-center mb-6 bg-slate-700 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">SCORE</p>
                  <p className="text-white text-2xl font-bold">{score}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">COMBO</p>
                  <p className="text-orange-400 text-2xl font-bold">
                    {combo > 0 ? `${combo}x` : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-blue-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">TIME</p>
                  <p className="text-white text-2xl font-bold">{timeLeft}s</p>
                </div>
              </div>
            </div>

            {/* CENTERED WHITE GAME BOARD */}
            <div className="flex justify-center">
              <div
                className="bg-white rounded-xl p-4 shadow-xl"
                style={{ width: "380px" }}
              >
                <div
                  className="relative rounded-xl h-96 overflow-hidden border-4 border-slate-500 shadow-inner bg-center bg-cover"
                  style={{
                    backgroundImage: `url(${evaporatorCoil})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Vertical coil lines */}
                  <div className="absolute inset-0 flex justify-around items-center p-8 opacity-40">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-full bg-slate-400 rounded-full"
                      ></div>
                    ))}
                  </div>

                  {/* Horizontal coil lines */}
                  <div className="absolute inset-0 flex flex-col justify-around p-8 opacity-30">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-0.5 w-full bg-slate-400"></div>
                    ))}
                  </div>

                  {/* Dirt Spots */}
                  {dirtSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => cleanDirt(spot.id, spot.size)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-lg animate-pulse ${
                        spot.size === "large"
                          ? "w-14 h-14 bg-amber-900 border-4 border-amber-800"
                          : "w-10 h-10 bg-yellow-800 border-3 border-yellow-700"
                      } ${spot.type === "dust" ? "opacity-80" : "opacity-100"}`}
                      style={{
                        left: `${spot.x}%`,
                        top: `${spot.y}%`,
                      }}
                    >
                      <img
                        src={spot.type === "dust" ? dust : dirt}
                        alt="dirt spot"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {gameOver && (
          <div className="text-center py-12">
            <div
              className={`inline-block px-8 py-4 rounded-2xl mb-6 ${
                getMedal(score).bg
              } border-4 ${getMedal(score).color} border-current`}
            >
              <p className="text-6xl mb-2">{getMedal(score).icon}</p>
              <p className={`text-3xl font-bold ${getMedal(score).color}`}>
                {getMedal(score).name}
              </p>
            </div>

            <p className="text-5xl font-bold text-white mb-2">{score} Points</p>
            <p className="text-slate-400 mb-6">Missed: {missedSpots} spots</p>

            <div className="max-w-md mx-auto mb-8 bg-slate-700 rounded-xl p-6">
              <p className="text-slate-300 font-semibold mb-3">
                Medal Requirements:
              </p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-amber-600">🥉 Bronze</span>
                  <span className="text-slate-400">
                    {BRONZE_THRESHOLD}+ points
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">🥈 Silver</span>
                  <span className="text-slate-400">
                    {SILVER_THRESHOLD}+ points
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400">🥇 Gold</span>
                  <span className="text-slate-400">
                    {GOLD_THRESHOLD}+ points (Master)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-500 mb-6">
              💡 Build combos by cleaning quickly! Every 5 hits increases your
              multiplier.
            </div>

            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-12 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanTheCoilGame;
