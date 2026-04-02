const CandidateCard = ({ candidate, onVote, disabled, isVoted }) => {
  return (
    <div className={`p-6 rounded-xl border-2 transition-all ${isVoted ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
          <p className="text-gray-500 font-medium">{candidate.party}</p>
        </div>
        {candidate.voteCount !== undefined && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
            {candidate.voteCount} Votes
          </div>
        )}
      </div>
      
      {onVote && (
        <button
          onClick={() => onVote(candidate.id)}
          disabled={disabled}
          className={`w-full py-2 rounded-lg font-bold transition-colors ${
            disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isVoted ? 'Voted' : 'Vote'}
        </button>
      )}
    </div>
  );
};

export default CandidateCard;
