import { useState } from 'react';
import { Pill, KeyRound, X } from 'lucide-react';

const SECURITY_CODE = '1208';

interface LoginGateProps {
  onLogin: () => void;
  currentPassword: string;
  onPasswordChange: (newPassword: string) => void;
}

const LoginGate = ({ onLogin, currentPassword, onPasswordChange }: LoginGateProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showChange, setShowChange] = useState(false);
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changeMsg, setChangeMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'mes' && password === currentPassword) {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== SECURITY_CODE) {
      setChangeMsg({ ok: false, text: 'Incorrect security code' });
      return;
    }
    if (newPass.length < 4) {
      setChangeMsg({ ok: false, text: 'New password must be at least 4 characters' });
      return;
    }
    if (newPass !== confirmPass) {
      setChangeMsg({ ok: false, text: 'Passwords do not match' });
      return;
    }
    onPasswordChange(newPass);
    setChangeMsg({ ok: true, text: 'Password updated — use it to log in' });
    setCode('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-950 via-leaf-900 to-leaf-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tobacco-600 mb-4 shadow-lg shadow-black/40">
            <Pill className="w-8 h-8 text-cream" />
          </div>
          <h1 className="text-3xl font-bold text-cream">Helvion Pharma</h1>
          <p className="text-tobacco-400 font-medium mt-1">Plant 2 · Lakeworth</p>
          <p className="text-green-100/70 text-sm mt-3">
            MES ↔ Barcode Printer &amp; Labeling Integration Workshop — Pharmaceutical (OSD) Manufacturing
          </p>
        </div>

        <div className="bg-white/95 rounded-2xl shadow-2xl p-8">
          {!showChange ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tobacco-500 focus:border-tobacco-500 outline-none"
                  placeholder="Enter username"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tobacco-500 focus:border-tobacco-500 outline-none"
                  placeholder="Enter password"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-tobacco-600 hover:bg-tobacco-700 text-white font-semibold rounded-lg transition-colors"
              >
                Enter Workshop
              </button>
              <button
                type="button"
                onClick={() => setShowChange(true)}
                className="w-full text-sm text-gray-500 hover:text-tobacco-600 flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Change password
              </button>
            </form>
          ) : (
            <form onSubmit={handleChange} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Change Password</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowChange(false);
                    setChangeMsg(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security code</label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tobacco-500 outline-none"
                  placeholder="Instructor security code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tobacco-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tobacco-500 outline-none"
                />
              </div>
              {changeMsg && (
                <p
                  className={`text-sm rounded-lg px-3 py-2 ${
                    changeMsg.ok ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
                  }`}
                >
                  {changeMsg.text}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-leaf-700 hover:bg-leaf-600 text-white font-semibold rounded-lg transition-colors"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-green-100/40 text-xs mt-6">
          Training environment · fictional company &amp; products · no real production data
        </p>
      </div>
    </div>
  );
};

export default LoginGate;
