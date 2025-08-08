
import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import './App.css';


type Student = {
  id: number;
  name: string;
  roll: string;
  registered: boolean;
};

const initialStudents: Student[] = [];

function App() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roll.trim()) return;
    setStudents([
      ...students,
      { id: Date.now(), name, roll, registered: false },
    ]);
    setName('');
    setRoll('');
  };

  // WebAuthn registration (client-side only, demo purpose)
  const registerBiometric = async (id: number) => {
    try {
      // In a real app, fetch options from your server
      const options = {
        challenge: Uint8Array.from('demo-challenge-' + id, c => c.charCodeAt(0)),
        rp: { name: 'College Attendance Demo' },
        user: {
          id: Uint8Array.from(String(id), c => c.charCodeAt(0)),
          name: students.find(s => s.id === id)?.name || '',
          displayName: students.find(s => s.id === id)?.name || '',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: 'platform' },
        timeout: 60000,
        attestation: 'none',
      };
      await startRegistration(options as any);
      setStudents(students.map(s => s.id === id ? { ...s, registered: true } : s));
      alert('Biometric registered!');
    } catch (err: any) {
      alert('Registration failed: ' + (err?.message || err));
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h2>Admin Panel: Add Student</h2>
      <form onSubmit={addStudent} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Roll Number"
          value={roll}
          onChange={e => setRoll(e.target.value)}
          required
        />
        <button type="submit">Add Student</button>
      </form>
      <h3 style={{ marginTop: 32 }}>Student List</h3>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {students.map(student => (
          <li key={student.id} style={{ border: '1px solid #ccc', borderRadius: 8, margin: '8px 0', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{student.name}</strong> <br />
              <span>Roll: {student.roll}</span>
            </div>
            <button
              style={{ background: student.registered ? '#4caf50' : '#2196f3', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px' }}
              onClick={() => registerBiometric(student.id)}
              disabled={student.registered}
            >
              {student.registered ? 'Registered' : 'Register Biometric'}
            </button>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 12, color: '#888', marginTop: 32 }}>
        This is a prototype. Biometric registration uses WebAuthn and works on supported mobile browsers.
      </p>
    </div>
  );
}

export default App
