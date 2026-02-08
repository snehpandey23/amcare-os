import { ZohoTask } from '../services/zohoSync';
import './TaskFilters.css';

interface TaskFiltersProps {
  onFilterChange: (filters: {
    type?: ZohoTask['type'];
    status?: ZohoTask['status'];
    priority?: ZohoTask['priority'];
  }) => void;
  activeFilters: {
    type?: ZohoTask['type'];
    status?: ZohoTask['status'];
    priority?: ZohoTask['priority'];
  };
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ onFilterChange, activeFilters }) => {
  const taskTypes: Array<{ value: ZohoTask['type']; label: string; icon: string }> = [
    { value: 'payment', label: 'Payment Check', icon: '💳' },
    { value: 'form', label: 'Form Completion', icon: '📝' },
    { value: 'prechart', label: 'Pre-Charting', icon: '📋' },
    { value: 'chat', label: 'Chat Review', icon: '💬' },
    { value: 'fax', label: 'Fax Handling', icon: '📠' },
    { value: 'note', label: 'Note Locking', icon: '🔒' },
  ];

  const statuses: Array<{ value: ZohoTask['status']; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorities: Array<{ value: ZohoTask['priority']; label: string }> = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const handleFilterChange = (key: 'type' | 'status' | 'priority', value: string) => {
    const newFilters = { ...activeFilters };
    if (value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value as any;
    }
    onFilterChange(newFilters);
  };

  return (
    <div className="task-filters">
      <div className="filter-group">
        <label>Task Type</label>
        <select
          value={activeFilters.type || 'all'}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="all">All Types</option>
          {taskTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select
          value={activeFilters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Priority</label>
        <select
          value={activeFilters.priority || 'all'}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="all">All Priorities</option>
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>

      <button
        className="clear-filters-btn"
        onClick={() => onFilterChange({})}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default TaskFilters;
