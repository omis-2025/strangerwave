interface ConnectionStatusProps {
  connected: boolean;
  activeUsers: number;
}

export default function ConnectionStatus({ connected, activeUsers }: ConnectionStatusProps) {
  return (
    <div className="bg-surface rounded-lg p-4 mb-6 flex justify-between items-center">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success' : 'bg-amber-500'} mr-2 animate-pulse`}></div>
        <span className="text-text-primary font-medium">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="text-text-secondary text-sm">
        <span>{activeUsers.toLocaleString()}</span> users online
      </div>
    </div>
  );
}
