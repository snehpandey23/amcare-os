import { useEffect, useState } from 'react';

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  source: string;
};

type Suggestion = {
  id: string;
  agent: string;
  content: string;
  confidence: number;
  approved: boolean;
};

const headers = {
  'Content-Type': 'application/json',
  'x-org-id': 'demo-org',
  'x-user-id': 'clinician-1',
  'x-role': 'admin',
};

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [patientName, setPatientName] = useState('');

  const load = async () => {
    const [p, t, s] = await Promise.all([
      fetch('/api/patients', { headers }).then((r) => r.json()),
      fetch('/api/tasks', { headers }).then((r) => r.json()),
      fetch('/api/agents/suggestions', { headers }).then((r) => r.json()),
    ]);
    setPatients(p.patients || []);
    setTasks(t.tasks || []);
    setSuggestions(s.suggestions || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const createPatient = async () => {
    const [firstName, ...rest] = patientName.trim().split(' ');
    const lastName = rest.join(' ') || 'Patient';
    if (!firstName) return;
    await fetch('/api/patients', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName,
        lastName,
        dob: '1988-01-01',
        insurance: 'BlueCross PPO',
      }),
    });
    setPatientName('');
    await load();
  };

  const runLabAutomation = async () => {
    if (!patients[0]) return;
    await fetch('/api/automation/lab-result', {
      method: 'POST',
      headers,
      body: JSON.stringify({ patientId: patients[0].id, wbc: 12.4 }),
    });
    await load();
  };

  const createAIDraft = async () => {
    if (!patients[0]) return;
    const enc = await fetch('/api/encounters', {
      method: 'POST',
      headers,
      body: JSON.stringify({ patientId: patients[0].id, diagnosis: 'R53.83' }),
    }).then((r) => r.json());

    await fetch('/api/notes/draft', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId: patients[0].id,
        encounterId: enc.encounter.id,
        transcript: 'Fatigue and increased thirst over two weeks.',
      }),
    });
    await load();
  };

  const approveSuggestion = async (id: string) => {
    await fetch(`/api/agents/suggestions/${id}/approve`, {
      method: 'POST',
      headers,
    });
    await load();
  };

  return (
    <div className="layout stack">
      <div className="panel">
        <h1>CAPR.AI Hybrid EMR MVP</h1>
        <p>Clinical + Ops + AI Workforce starter console for phased rollout.</p>
      </div>

      <div className="panel grid">
        <div className="metric"><h3>Patients</h3><p>{patients.length}</p></div>
        <div className="metric"><h3>Open Tasks</h3><p>{tasks.filter((t) => t.status !== 'done').length}</p></div>
        <div className="metric"><h3>AI Suggestions</h3><p>{suggestions.length}</p></div>
      </div>

      <div className="panel stack">
        <h2>Clinical Intake</h2>
        <div className="row">
          <input
            placeholder="Patient name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
          <button onClick={createPatient}>Add patient</button>
          <button onClick={createAIDraft}>Generate AI note draft</button>
          <button onClick={runLabAutomation}>Run WBC automation</button>
        </div>
      </div>

      <div className="panel">
        <h2>Patient Chart Shell</h2>
        <ul>
          {patients.map((p) => (
            <li key={p.id}>
              {p.firstName} {p.lastName} ({p.mrn})
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h2>Practice Ops Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.title} - {task.source}
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h2>7-Agent Suggestion Queue</h2>
        <ul>
          {suggestions.map((s) => (
            <li key={s.id}>
              <strong>{s.agent}</strong> ({Math.round(s.confidence * 100)}%): {s.content.slice(0, 80)}
              {!s.approved && <button onClick={() => approveSuggestion(s.id)}>Approve</button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
