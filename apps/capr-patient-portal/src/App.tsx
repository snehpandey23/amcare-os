import { useState } from 'react';

const headers = {
  'Content-Type': 'application/json',
  'x-org-id': 'demo-org',
  'x-user-id': 'patient-1',
  'x-role': 'staff',
};

function App() {
  const [patientId, setPatientId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const submitIntake = async () => {
    if (!patientId) return;
    await fetch('/api/patient/intake', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId,
        answers: {
          chiefComplaint: 'Headache x 3 weeks',
          painScore: '7',
          allergies: 'None reported',
        },
      }),
    });
    setStatus('Intake submitted');
  };

  const sendMessage = async () => {
    if (!patientId || !message) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId,
        channel: 'in_app',
        latestMessage: message,
      }),
    });
    setMessage('');
    setStatus('Message sent');
  };

  const addCaregiver = async () => {
    if (!patientId) return;
    await fetch('/api/patient/caregivers', {
      method: 'POST',
      headers: { ...headers, 'x-role': 'admin' },
      body: JSON.stringify({
        patientId,
        caregiverName: 'Alex Doe',
        relationship: 'Spouse',
      }),
    });
    setStatus('Caregiver linked');
  };

  return (
    <main style={{ maxWidth: 720, margin: '32px auto', fontFamily: 'Inter, sans-serif' }}>
      <h1>CAPR Patient Portal MVP</h1>
      <p>Self-service intake, secure messaging, and caregiver linkage.</p>
      <div style={{ display: 'grid', gap: 10 }}>
        <input
          placeholder="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          style={{ padding: 10 }}
        />
        <button onClick={submitIntake}>Submit intake form</button>
        <textarea
          placeholder="Send message to care team"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: 10, minHeight: 80 }}
        />
        <button onClick={sendMessage}>Send message</button>
        <button onClick={addCaregiver}>Link caregiver</button>
        <p>{status}</p>
      </div>
    </main>
  );
}

export default App;
