import { useEffect } from 'react';
import { useResults } from '../hooks/useResults';
import { useElection } from '../hooks/useElection';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Results = () => {
  const { candidates, getResults } = useResults();
  const { phase, getPhase } = useElection();

  useEffect(() => {
    getResults();
    getPhase();
  }, [getResults, getPhase]);

  const totalVotes = candidates.reduce((acc, c) => acc + c.voteCount, 0);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Election Results</h1>
      
      {phase !== 3 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <p className="text-blue-800 font-medium">
            The election is currently active. Results shown are LIVE tallies.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 font-bold mb-1">Total Votes Cast</p>
          <p className="text-4xl font-black text-blue-600">{totalVotes}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 font-bold mb-1">Total Candidates</p>
          <p className="text-4xl font-black text-blue-600">{candidates.length}</p>
        </div>
      </div>

      {candidates.length > 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={candidates} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="voteCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 text-lg">
          No data available to display.
        </div>
      )}
    </div>
  );
};

export default Results;
