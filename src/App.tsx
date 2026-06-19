import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { AuthDialog } from './components/AuthDialog';
import { useAuth } from './hooks/useAuth';
import { saveScore, getMyScores } from './lib/api';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import keyImage from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

export default function App() {
  const auth = useAuth();

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<Array<{ score: number; played_at: string }>>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Save score and refresh history when game ends for authenticated users
  useEffect(() => {
    if (gameEnded && auth.user) {
      saveScore(score, auth.user.token)
        .then(() => getMyScores(auth.user!.token))
        .then(data => {
          setScoreHistory(data.scores);
          setBestScore(data.best);
        })
        .catch(console.error);
    }
  }, [gameEnded]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 100 : score - 50;
          setScore(newScore);

          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  const resetGame = () => {
    initializeGame();
  };

  const isAuthenticated = auth.user !== null || auth.isGuest;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">

      <AuthDialog
        open={!isAuthenticated}
        auth={auth}
        onAuthenticated={() => {}}
      />

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 bg-amber-800/10 border-b border-amber-200">
        <span className="text-sm text-amber-700">
          {auth.user ? `Welcome, ${auth.user.username}!` : 'Playing as Guest'}
        </span>
        {auth.user ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-200"
            onClick={auth.logout}
          >
            Sign Out
          </Button>
        ) : auth.isGuest ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-200"
            onClick={auth.logout}
          >
            Sign In
          </Button>
        ) : null}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: box.isOpen ? 'default' : `url(${keyImage}) 16 16, pointer` }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1,
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src={
                  box.isOpen
                    ? box.hasTreasure
                      ? treasureChest
                      : skeletonChest
                    : closedChest
                }
                alt={
                  box.isOpen
                    ? box.hasTreasure
                      ? 'Treasure!'
                      : 'Skeleton!'
                    : 'Treasure Chest'
                }
                className="w-48 h-48 object-contain drop-shadow-lg"
              />

              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$100' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">Click to open!</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {auth.user && (
              <p className="text-xs text-amber-500 mt-2">Score saved to your account ✓</p>
            )}
            {auth.user && scoreHistory.length > 0 && (
              <div className="mt-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-amber-900">My Score History</h3>
                  {bestScore !== null && (
                    <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      Best: ${bestScore}
                    </span>
                  )}
                </div>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-amber-300 divide-y divide-amber-200">
                  {scoreHistory.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-amber-50 text-xs">
                      <span className={entry.score >= 0 ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                        ${entry.score}
                      </span>
                      <span className="text-amber-500">
                        {new Date(entry.played_at + ' UTC').toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {auth.isGuest && (
              <p className="text-xs text-amber-600 mt-2">
                <button
                  className="underline hover:text-amber-800"
                  onClick={auth.logout}
                >
                  Sign in
                </button>{' '}
                to save your scores!
              </p>
            )}
          </div>

          <Button
            onClick={resetGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
