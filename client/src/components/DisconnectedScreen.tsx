interface DisconnectedScreenProps {
  onNewChat: () => void;
  onBackToWelcome: () => void;
}

export default function DisconnectedScreen({ onNewChat, onBackToWelcome }: DisconnectedScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-14 w-14 text-error mb-4" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 6H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" />
          <path d="M6 13v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
        <h2 className="text-xl font-bold text-text-primary mb-2">Chat Ended</h2>
        <p className="text-text-secondary max-w-md mx-auto">Your conversation with the stranger has ended.</p>
      </div>
      
      <div className="flex gap-3 mt-4">
        <button 
          onClick={onNewChat}
          className="bg-primary hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg transition-colors flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          New Chat
        </button>
        <button 
          onClick={onBackToWelcome}
          className="bg-surface-light hover:bg-gray-700 text-text-primary font-medium py-2 px-5 rounded-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
