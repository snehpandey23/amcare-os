import './SyncStatus.css';

interface SyncStatusProps {
  status: 'syncing' | 'success' | 'error';
  lastSync: Date;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ status, lastSync }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={`sync-status ${status}`}>
      <div className="sync-indicator">
        {status === 'syncing' && <span className="spinner">⟳</span>}
        {status === 'success' && <span className="check">✓</span>}
        {status === 'error' && <span className="error">✗</span>}
      </div>
      <div className="sync-info">
        <span className="sync-label">Zoho Sync</span>
        <span className="sync-time">{formatTime(lastSync)}</span>
      </div>
    </div>
  );
};

export default SyncStatus;
