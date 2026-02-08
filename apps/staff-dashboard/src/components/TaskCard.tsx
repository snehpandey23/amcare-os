import { ZohoTask } from '../services/zohoSync';
import './TaskCard.css';

interface TaskCardProps {
  task: ZohoTask;
  onComplete: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: ZohoTask['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onStatusUpdate }) => {
  const getStatusColor = (status: ZohoTask['status']) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'in_progress':
        return '#2563eb';
      case 'completed':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: ZohoTask['priority']) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`task-card ${task.status}`}>
      <div className="task-header">
        <div className="task-title-row">
          <h3 className="task-title">{task.title}</h3>
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.patientName && (
        <div className="task-patient">
          <span className="patient-label">Patient:</span>
          <span className="patient-name">{task.patientName}</span>
        </div>
      )}

      {task.dueDate && (
        <div className="task-due-date">
          <span className="due-label">Due:</span>
          <span className="due-value">{formatDate(task.dueDate)}</span>
        </div>
      )}

      <div className="task-actions">
        {task.status !== 'completed' && (
          <>
            {task.status === 'pending' && (
              <button
                className="action-btn start-btn"
                onClick={() => onStatusUpdate(task.id, 'in_progress')}
              >
                Start
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                className="action-btn complete-btn"
                onClick={() => onComplete(task.id)}
              >
                Complete
              </button>
            )}
            <button
              className="action-btn view-btn"
              onClick={() => {
                if (task.zohoRecordId) {
                  window.open(`https://www.zoho.com/crm/record/${task.zohoRecordId}`, '_blank');
                }
              }}
            >
              View in Zoho
            </button>
          </>
        )}
        {task.status === 'completed' && (
          <span className="completed-indicator">✓ Completed</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
