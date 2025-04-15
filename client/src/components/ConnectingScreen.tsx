interface ConnectingScreenProps {
  onCancel: () => void;
}

export default function ConnectingScreen({ onCancel }: ConnectingScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-text-primary">Finding someone to chat with...</h2>
        <p className="text-text-secondary mt-2">This might take a moment</p>
      </div>
      <button 
        onClick={onCancel}
        className="bg-surface-light hover:bg-gray-700 text-text-primary font-medium py-2 px-5 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
