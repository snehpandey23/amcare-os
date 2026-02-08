import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import zohoSync, { ZohoTask } from '../services/zohoSync';
import TaskCard from '../components/TaskCard';
import SyncStatus from '../components/SyncStatus';
import KPICard from '../components/KPICard';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<ZohoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'success' | 'error'>('success');

  useEffect(() => {
    // Start real-time sync
    zohoSync.startRealTimeSync(30000); // Sync every 30 seconds

    // Subscribe to task updates
    const unsubscribe = zohoSync.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
      setLastSync(new Date());
      setSyncStatus('success');
      setLoading(false);
    });

    // Initial load
    zohoSync.syncTasks().catch(() => {
      setSyncStatus('error');
      setLoading(false);
    });

    return () => {
      unsubscribe();
      zohoSync.stopRealTimeSync();
    };
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    try {
      setSyncStatus('syncing');
      await zohoSync.completeTask(taskId);
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to complete task:', error);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, status: ZohoTask['status']) => {
    try {
      setSyncStatus('syncing');
      await zohoSync.updateTaskStatus(taskId, status);
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to update task status:', error);
    }
  };

  // Group tasks by type
  const tasksByType = {
    payment: tasks.filter(t => t.type === 'payment'),
    form: tasks.filter(t => t.type === 'form'),
    prechart: tasks.filter(t => t.type === 'prechart'),
    chat: tasks.filter(t => t.type === 'chat'),
    fax: tasks.filter(t => t.type === 'fax'),
    note: tasks.filter(t => t.type === 'note'),
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Daily Tasks Dashboard</h1>
          <p className="welcome-text">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="header-actions">
          <SyncStatus status={syncStatus} lastSync={lastSync} />
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="kpi-section">
        <KPICard title="Pending Tasks" value={pendingCount} color="#f59e0b" />
        <KPICard title="In Progress" value={inProgressCount} color="#2563eb" />
        <KPICard title="Completed Today" value={completedCount} color="#10b981" />
        <KPICard title="High Priority" value={highPriorityCount} color="#ef4444" />
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <div className="tasks-container">
          <TaskSection
            title="💳 Payment Check"
            tasks={tasksByType.payment}
            onComplete={handleTaskComplete}
            onStatusUpdate={handleTaskStatusUpdate}
          />
          <TaskSection
            title="📝 Form Completion"
            tasks={tasksByType.form}
            onComplete={handleTaskComplete}
            onStatusUpdate={handleTaskStatusUpdate}
          />
          <TaskSection
            title="📋 Pre-Charting"
            tasks={tasksByType.prechart}
            onComplete={handleTaskComplete}
            onStatusUpdate={handleTaskStatusUpdate}
          />
          <TaskSection
            title="💬 Chat Review"
            tasks={tasksByType.chat}
            onComplete={handleTaskComplete}
            onStatusUpdate={handleTaskStatusUpdate}
          />
          <TaskSection
            title="📠 Fax Handling"
            tasks={tasksByType.fax}
            onComplete={handleTaskComplete}
            onStatusUpdate={handleTaskStatusUpdate}
          />
          <TaskSection
            title="🔒 Note Locking"
            tasks={tasksByType.note}
            onComplete={handleTaskComplete}
            onStatusUpdate={handleTaskStatusUpdate}
          />
        </div>
      )}
    </div>
  );
};

interface TaskSectionProps {
  title: string;
  tasks: ZohoTask[];
  onComplete: (taskId: string) => void;
  onStatusUpdate: (taskId: string, status: ZohoTask['status']) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({ title, tasks, onComplete, onStatusUpdate }) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="task-section">
      <h2 className="section-title">{title} ({tasks.length})</h2>
      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
