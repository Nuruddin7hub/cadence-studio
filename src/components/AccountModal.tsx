import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  HardDrive,
  KeyRound,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { AVATAR_COLORS, formatBytes } from '../utils/authStorage';
import { buildIcsExport, triggerFileDownload } from '../utils/ics';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const AccountModal: React.FC = () => {
  const {
    snapshot,
    currentUser,
    savedAccounts,
    storageStats,
    accountModalOpen,
    setAccountModalOpen,
    accountModalTab,
    openAccountModal,
    signUp,
    signIn,
    switchToGuest,
    updateProfile,
    changePassword,
    deleteAccount,
    exportAccountBundle,
    importWorkspaceJson,
    importStarterChecklist,
    resetToSeed,
    pushToast,
  } = useWorkspace();

  const [mode, setMode] = useState<'signup' | 'signin' | 'profile'>(accountModalTab);
  const [profileSection, setProfileSection] = useState<'general' | 'security' | 'storage'>('general');

  // Auth form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [carryGuestData, setCarryGuestData] = useState(true);
  const [includeStarter, setIncludeStarter] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Profile edit fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editColor, setEditColor] = useState(AVATAR_COLORS[0]);

  // Password change fields
  const [currPw, setCurrPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const hasGuestWork =
    snapshot.events.length > 0 ||
    snapshot.tasks.length > 0 ||
    snapshot.habits.length > 0 ||
    Object.keys(snapshot.notes).length > 0;

  useEffect(() => {
    if (!accountModalOpen) return;
    setErrorMsg(null);
    setConfirmDeleteId(null);
    setConfirmReset(false);
    setMode(currentUser && accountModalTab === 'profile' ? 'profile' : accountModalTab);
    if (currentUser) {
      setEditName(currentUser.name);
      setEditEmail(currentUser.email);
      setEditRole(currentUser.roleTitle ?? '');
      setEditColor(currentUser.avatarColor);
    } else {
      setCarryGuestData(hasGuestWork);
    }
  }, [accountModalOpen, accountModalTab, currentUser, hasGuestWork]);

  if (!accountModalOpen) return null;

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password !== confirmPw) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const res = await signUp({
        name,
        email,
        password,
        avatarColor,
        roleTitle,
        carryGuestData: hasGuestWork && carryGuestData,
        includeStarter,
      });
      if (!res.ok) {
        setErrorMsg(res.error ?? 'Could not create account.');
      } else {
        setPassword('');
        setConfirmPw('');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await signIn(email, password);
      if (!res.ok) {
        setErrorMsg(res.error ?? 'Sign in failed.');
      } else {
        setPassword('');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await updateProfile({
        name: editName,
        email: editEmail,
        roleTitle: editRole,
        avatarColor: editColor,
      });
      if (!res.ok) setErrorMsg(res.error ?? 'Profile update failed.');
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setBusy(true);
    try {
      const res = await changePassword(currPw, nextPw);
      if (!res.ok) {
        setErrorMsg(res.error ?? 'Could not change password.');
      } else {
        setCurrPw('');
        setNextPw('');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void file.text().then((txt) => {
      const ok = importWorkspaceJson(txt);
      if (!ok) {
        setErrorMsg('Selected file is not a valid Cadence workspace JSON backup.');
      } else {
        setErrorMsg(null);
      }
    });
    e.target.value = '';
  };

  const formattedSavedTime = storageStats.savedAt
    ? new Date(storageStats.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Synced';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={() => setAccountModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Account and Browser Storage Vault"
    >
      <div
        className="w-full max-w-lg rounded-2xl border overflow-hidden my-auto max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--rule-strong)',
          boxShadow: 'var(--shadow-panel)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0"
              style={{
                backgroundColor: currentUser?.avatarColor ?? 'var(--accent-primary)',
              }}
            >
              {currentUser ? getInitials(currentUser.name) : <Database className="w-4 h-4" />}
            </span>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-[15px] text-[var(--ink-primary)] truncate">
                {currentUser ? currentUser.name : 'Account & Storage Vault'}
              </h2>
              <p className="text-[11.5px] text-[var(--ink-secondary)] truncate">
                {currentUser
                  ? `${currentUser.email} · ${formatBytes(storageStats.bytesUsed)} saved`
                  : `Guest Workspace · ${formatBytes(storageStats.bytesUsed)} saved locally`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAccountModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
            aria-label="Close account dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="px-3.5 py-2.5 rounded-xl border text-[12.5px]"
              style={{
                backgroundColor: 'var(--accent-coral-soft)',
                borderColor: 'var(--accent-coral)',
                color: 'var(--ink-primary)',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Signed-in vs Auth Switcher */}
          {currentUser && mode === 'profile' ? (
            <>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl border bg-[var(--bg-inset)] text-[12px] font-medium">
                {(
                  [
                    ['general', 'Profile'],
                    ['security', 'Security & Switch'],
                    ['storage', 'Storage & Backup'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setProfileSection(id);
                      setErrorMsg(null);
                    }}
                    className="py-1.5 px-2 rounded-lg transition-colors truncate"
                    style={{
                      backgroundColor: profileSection === id ? 'var(--bg-elevated)' : 'transparent',
                      color: profileSection === id ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {profileSection === 'general' && (
                <form onSubmit={handleProfileSave} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Display Name</span>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </label>
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Role / Workspace Label</span>
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        placeholder="e.g. Designer, Founder, Student"
                        className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1 text-[12px]">
                    <span className="text-[var(--ink-secondary)] font-medium">Account Email</span>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </label>

                  <div className="space-y-1.5">
                    <span className="text-[12px] text-[var(--ink-secondary)] font-medium block">Avatar Color</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {AVATAR_COLORS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setEditColor(hex)}
                          aria-label={`Select color ${hex}`}
                          className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: hex,
                            borderColor: editColor === hex ? '#FFFFFF' : 'transparent',
                          }}
                        >
                          {editColor === hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => void switchToGuest()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12.5px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out to Guest</span>
                    </button>

                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white disabled:opacity-60"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Save Profile</span>
                    </button>
                  </div>
                </form>
              )}

              {profileSection === 'security' && (
                <div className="space-y-4">
                  <form onSubmit={handlePasswordChange} className="space-y-2.5 p-3.5 rounded-xl border bg-[var(--bg-elevated)]/40">
                    <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-primary)]">
                      <KeyRound className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Update Password</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={currPw}
                      onChange={(e) => setCurrPw(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[12.5px] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={nextPw}
                        onChange={(e) => setNextPw(e.target.value)}
                        placeholder="New password (6+ chars)"
                        className="flex-1 px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[12.5px] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                      <button
                        type="submit"
                        disabled={busy}
                        className="px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white shrink-0"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      >
                        Update
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[var(--ink-secondary)]">
                        Saved Browser Accounts ({savedAccounts.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => openAccountModal('signup')}
                        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--accent-primary)] hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>New account</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {savedAccounts.map((acc) => {
                        const isActive = acc.id === currentUser.id;
                        return (
                          <div
                            key={acc.id}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border bg-[var(--bg-inset)]/60"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                style={{ backgroundColor: acc.avatarColor }}
                              >
                                {getInitials(acc.name)}
                              </span>
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-medium text-[var(--ink-primary)] truncate">
                                  {acc.name} {isActive && <span className="text-[10.5px] text-[var(--accent-emerald)]">(Active)</span>}
                                </div>
                                <div className="text-[11px] text-[var(--ink-muted)] truncate">{acc.email}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {!isActive && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEmail(acc.email);
                                    setMode('signin');
                                  }}
                                  className="px-2.5 py-1 rounded-lg border text-[11.5px] hover:bg-[var(--bg-hover)]"
                                >
                                  Sign In
                                </button>
                              )}
                              {confirmDeleteId === acc.id ? (
                                <button
                                  type="button"
                                  onClick={() => void deleteAccount(acc.id)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-[var(--accent-coral)]"
                                >
                                  Confirm Delete
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(acc.id)}
                                  className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--accent-coral)] hover:bg-[var(--bg-hover)]"
                                  aria-label={`Delete account ${acc.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {profileSection === 'storage' && (
                <StorageBackupPanel
                  storageStats={storageStats}
                  formattedSavedTime={formattedSavedTime}
                  snapshot={snapshot}
                  confirmReset={confirmReset}
                  setConfirmReset={setConfirmReset}
                  onExportBundle={exportAccountBundle}
                  onTriggerImport={() => importInputRef.current?.click()}
                  onExportIcs={() => {
                    triggerFileDownload('cadence-calendar.ics', buildIcsExport(snapshot.events), 'text/calendar');
                    pushToast('Calendar .ics downloaded', undefined, false, 'success');
                  }}
                  onImportStarter={importStarterChecklist}
                  onResetClean={() => {
                    resetToSeed();
                    setConfirmReset(false);
                  }}
                />
              )}
            </>
          ) : (
            <>
              {/* Auth tabs (Create Account / Sign In) */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl border bg-[var(--bg-inset)] text-[12.5px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  style={{
                    backgroundColor: mode === 'signup' ? 'var(--bg-elevated)' : 'transparent',
                    color: mode === 'signup' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className="py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  style={{
                    backgroundColor: mode === 'signin' ? 'var(--bg-elevated)' : 'transparent',
                    color: mode === 'signin' ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  }}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>

              {mode === 'signup' ? (
                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Your Name</span>
                      <input
                        type="text"
                        required
                        minLength={2}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </label>
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Role (optional)</span>
                      <input
                        type="text"
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        placeholder="Engineer, Student..."
                        className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1 text-[12px]">
                    <span className="text-[var(--ink-secondary)] font-medium">Email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Password (6+ chars)</span>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••"
                          className="w-full px-3 py-2 pr-9 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                          {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </label>
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Confirm Password</span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[12px] text-[var(--ink-secondary)]">Badge color</span>
                    <div className="flex items-center gap-1.5">
                      {AVATAR_COLORS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setAvatarColor(hex)}
                          aria-label={`Pick avatar color ${hex}`}
                          className="w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: hex,
                            borderColor: avatarColor === hex ? '#FFFFFF' : 'transparent',
                          }}
                        >
                          {avatarColor === hex && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 text-[12px]">
                    {hasGuestWork && (
                      <label className="flex items-center gap-2 text-[var(--ink-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={carryGuestData}
                          onChange={(e) => setCarryGuestData(e.target.checked)}
                          className="accent-[#E74004]"
                        />
                        <span>Keep my current Guest tasks & blocks in this new account</span>
                      </label>
                    )}
                    <label className="flex items-center gap-2 text-[var(--ink-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeStarter}
                        onChange={(e) => setIncludeStarter(e.target.checked)}
                        className="accent-[#E74004]"
                      />
                      <span>Include optional 3-task starter checklist for today</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    Create Local Vault Account
                  </button>
                </form>
              ) : (
                <div className="space-y-3.5">
                  {savedAccounts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11.5px] font-medium text-[var(--ink-secondary)] block">
                        Saved accounts on this browser (tap to prefill):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {savedAccounts.map((acc) => (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => setEmail(acc.email)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-[12px]"
                          >
                            <span
                              aria-hidden="true"
                              className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                              style={{ backgroundColor: acc.avatarColor }}
                            >
                              {getInitials(acc.name)[0]}
                            </span>
                            <span className="text-[var(--ink-primary)] font-medium">{acc.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSignInSubmit} className="space-y-3">
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Account Email</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </label>
                    <label className="block space-y-1 text-[12px]">
                      <span className="text-[var(--ink-secondary)] font-medium">Password</span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-inset)] text-[13px] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                      Sign In & Load Vault
                    </button>
                  </form>
                </div>
              )}

              {/* Guest Storage & Portable Backup summary */}
              <div className="pt-3 border-t space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[var(--ink-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
                    <span>{storageStats.engine} · {formatBytes(storageStats.bytesUsed)} used</span>
                  </span>
                  <span>Stored privately in your browser</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={exportAccountBundle}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Backup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore File</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileImport}
          />
        </div>
      </div>
    </div>
  );
};

interface StorageBackupPanelProps {
  storageStats: {
    engine: string;
    persisted: boolean;
    bytesUsed: number;
    savedAt: string | null;
    accountCount: number;
  };
  formattedSavedTime: string;
  snapshot: {
    events: unknown[];
    tasks: unknown[];
    habits: unknown[];
    notes: Record<string, unknown>;
    focusHistory: unknown[];
  };
  confirmReset: boolean;
  setConfirmReset: (v: boolean) => void;
  onExportBundle: () => void;
  onTriggerImport: () => void;
  onExportIcs: () => void;
  onImportStarter: () => void;
  onResetClean: () => void;
}

const StorageBackupPanel: React.FC<StorageBackupPanelProps> = ({
  storageStats,
  formattedSavedTime,
  snapshot,
  confirmReset,
  setConfirmReset,
  onExportBundle,
  onTriggerImport,
  onExportIcs,
  onImportStarter,
  onResetClean,
}) => (
  <div className="space-y-3.5">
    <div className="p-3.5 rounded-xl border bg-[var(--bg-elevated)]/45 space-y-2">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ink-primary)]">
          <HardDrive className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>{storageStats.engine}</span>
        </span>
        <span className="font-mono-num text-[11.5px] text-[var(--accent-emerald)]">
          {storageStats.persisted ? 'Persistent' : 'Auto-saved'} · {formattedSavedTime}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="p-2 rounded-lg bg-[var(--bg-inset)]">
          <div className="font-mono-num font-bold text-[14px] text-[var(--ink-primary)]">{snapshot.events.length}</div>
          <div className="text-[10.5px] text-[var(--ink-muted)]">Blocks</div>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-inset)]">
          <div className="font-mono-num font-bold text-[14px] text-[var(--ink-primary)]">{snapshot.tasks.length}</div>
          <div className="text-[10.5px] text-[var(--ink-muted)]">Tasks</div>
        </div>
        <div className="p-2 rounded-lg bg-[var(--bg-inset)]">
          <div className="font-mono-num font-bold text-[14px] text-[var(--ink-primary)]">
            {formatBytes(storageStats.bytesUsed)}
          </div>
          <div className="text-[10.5px] text-[var(--ink-muted)]">Vault Size</div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button
        type="button"
        onClick={onExportBundle}
        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12.5px] font-semibold text-white"
        style={{ backgroundColor: 'var(--accent-primary)' }}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Account (.json)</span>
      </button>
      <button
        type="button"
        onClick={onTriggerImport}
        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-[12.5px] font-medium"
      >
        <Upload className="w-3.5 h-3.5" />
        <span>Restore Backup (.json)</span>
      </button>
      <button
        type="button"
        onClick={onExportIcs}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-[12.5px] font-medium"
      >
        <Download className="w-3.5 h-3.5 text-[var(--accent-sky)]" />
        <span>Export Calendar (.ics)</span>
      </button>
      <button
        type="button"
        onClick={onImportStarter}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border bg-[var(--bg-inset)] hover:bg-[var(--bg-hover)] text-[12.5px] font-medium"
      >
        <Sparkles className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
        <span>Add Starter Checklist</span>
      </button>
    </div>

    <div className="pt-2 border-t flex items-center justify-between gap-2">
      <span className="text-[11.5px] text-[var(--ink-muted)]">Start fresh with an empty schedule</span>
      {confirmReset ? (
        <button
          type="button"
          onClick={onResetClean}
          className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-white bg-[var(--accent-coral)]"
        >
          Confirm Clear All
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="px-3 py-1.5 rounded-lg border text-[11.5px] text-[var(--accent-coral)] hover:bg-[var(--accent-coral-soft)]"
        >
          Clear Workspace
        </button>
      )}
    </div>
  </div>
);
