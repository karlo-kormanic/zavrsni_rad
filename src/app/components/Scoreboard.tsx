// components/Scoreboard.tsx
'use client';

interface ScoreboardProps {
  scores: Record<string, number>;
  isPlayerView?: boolean;
  currentPlayer?: string | null;
  winnerCount?: number;  // Add this line to include winnerCount in the props
}

const Scoreboard: React.FC<ScoreboardProps> = ({ 
  scores, 
  isPlayerView = false, 
  currentPlayer = null,
  winnerCount = 1  // Default value if not provided
}) => {
  // Convert scores object to array and sort by score (descending)
  const sortedScores = Object.entries(scores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className={`rounded-lg p-6 ${isPlayerView ? 'bg-gray-800' : 'bg-white shadow'}`}>
      <h2 className={`text-center text-xl font-semibold mb-4 ${isPlayerView ? 'text-white' : 'text-gray-800'}`}>
        {isPlayerView ? 'Your Results' : 'Leaderboard'}
      </h2>
      
      <div>
        <h3 className={`text-lg font-medium mb-3 ${isPlayerView ? 'text-gray-300' : 'text-gray-700'}`}>
          {isPlayerView ? 'Standings' : 'Top Players'}
        </h3>
        <ul className="space-y-2">
          {sortedScores.map(({ name, score }, index) => (
            <li
              key={name}
              className={`p-3 rounded flex justify-between items-center ${
                name === currentPlayer
                  ? 'bg-blue-600 font-bold border-2 border-blue-400'
                  : index < winnerCount 
                    ? isPlayerView 
                      ? 'bg-gray-700' 
                      : 'bg-yellow-50 border border-yellow-200'
                    : isPlayerView 
                      ? 'bg-gray-700' 
                      : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className={`mr-2 w-6 text-right ${
                  isPlayerView ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {index + 1}.
                </span>
                <span className={`${
                  name === currentPlayer 
                    ? 'text-white' 
                    : isPlayerView 
                      ? 'text-gray-200' 
                      : 'text-gray-800'
                }`}>
                  {name}
                  {name === currentPlayer && (
                    <span className="ml-2 text-blue-200 text-sm">(You)</span>
                  )}
                </span>
              </div>
              <span className={`font-mono ${
                name === currentPlayer 
                  ? 'text-white' 
                  : isPlayerView 
                    ? 'text-gray-300' 
                    : 'text-gray-800'
              }`}>
                {score} pts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Scoreboard;