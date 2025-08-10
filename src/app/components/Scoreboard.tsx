import React from 'react';

interface ScoreboardProps {
  scores: Record<string, number>;
  isPlayerView?: boolean;
  currentPlayer?: string | null;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ 
  scores, 
  isPlayerView = false, 
  currentPlayer 
}) => {
  // Convert scores object to array and sort by score (descending)
  const sortedScores = Object.entries(scores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4">
        {isPlayerView ? 'Your Results' : 'Leaderboard'}
      </h2>
      <ul className="space-y-3">
        {sortedScores.map(({ name, score }, index) => (
          <li 
            key={name}
            className={`flex justify-between items-center p-3 rounded-lg ${
              name === currentPlayer
                ? 'bg-blue-600 font-bold border-2 border-blue-400'
                : 'bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <span className="text-gray-300 mr-2 w-6 text-right">
                {index + 1}.
              </span>
              <span className={`${name === currentPlayer ? 'text-white' : 'text-gray-200'}`}>
                {name}
                {name === currentPlayer && (
                  <span className="ml-2 text-blue-200 text-sm">(You)</span>
                )}
              </span>
            </div>
            <span className={`font-mono ${name === currentPlayer ? 'text-white' : 'text-gray-300'}`}>
              {score} pts
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Scoreboard;