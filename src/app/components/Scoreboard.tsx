import { useEffect, useState } from 'react';

type ScoreboardProps = {
  scores: Record<string, number>;
  isPlayerView?: boolean;
};

const Scoreboard = ({ scores, isPlayerView = false }: ScoreboardProps) => {
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    if (isPlayerView) {
      const storedName = localStorage.getItem('playerName');
      setPlayerName(storedName);
    }
  }, [isPlayerView]);

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">
        {isPlayerView ? 'Final Results' : 'Final Scoreboard'}
      </h2>
      <ul className="space-y-1">
        {sortedScores.map(([name, score], index) => {
          const isCurrentPlayer = name === playerName;
          return (
            <li
              key={name}
              className={`text-gray-700 ${
                isCurrentPlayer ? 'font-bold text-blue-700' : ''
              }`}
            >
              {index + 1}. {name}: {score} point{score === 1 ? '' : 's'}
              {isCurrentPlayer && (
                <span className="ml-2 text-sm text-blue-500">(You)</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Scoreboard;
