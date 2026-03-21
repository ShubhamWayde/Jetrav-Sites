'use client';

import { useEffect, useMemo, useState } from 'react';
import { showSuccess, showError } from '@repo/auth';
import { useAuth } from '@repo/auth';
import { api } from '@/lib/api';
import { ADMIN_API } from '@/lib/constants';
import Button from '@repo/ui/Button';
import Spinner from '@repo/ui/Spinner';
import InputField from '@repo/ui/InputField';
import { EyeOffIcon, EyeOpenIcon, PencilIcon } from '@repo/ui/Icons';
import styles from './profile.module.css';
import { AdminProfile } from '@/app/types/profile';


type InfoErrors = { firstName?: string; lastName?: string };
type PwdErrors  = { oldPwd?: string; newPwd?: string; confirmPwd?: string };
type ShowPwd    = { oldPwd: boolean; newPwd: boolean; confirmPwd: boolean };

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(first = '', last = '') {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '?';
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { isLoading: authLoading } = useAuth();

  // ── Profile data ──────────────────────────────────────────────────────────
  const [profile,  setProfile]  = useState<AdminProfile | null>(null);
  const [fetching, setFetching] = useState(true);

  // ── General Info edit state ───────────────────────────────────────────────
  const [editMode,    setEditMode]    = useState(false);
  const [form,        setForm]        = useState({ firstName: '', lastName: '' });
  const [infoErrors,  setInfoErrors]  = useState<InfoErrors>({});
  const [infoSaving,  setInfoSaving]  = useState(false);

  // ── Password state ────────────────────────────────────────────────────────
  const [pwdForm,    setPwdForm]    = useState({ oldPwd: '', newPwd: '', confirmPwd: '' });
  const [pwdErrors,  setPwdErrors]  = useState<PwdErrors>({});
  const [pwdSaving,  setPwdSaving]  = useState(false);
  const [showPwd,    setShowPwd]    = useState<ShowPwd>({ oldPwd: false, newPwd: false, confirmPwd: false });

  // ── Computed ──────────────────────────────────────────────────────────────
  const initials    = getInitials(profile?.firstName, profile?.lastName);
  const fullName    = profile ? `${profile.firstName} ${profile.lastName}` : '—';
  const isInfoValid = useMemo(
    () => form.firstName.trim().length > 0 && form.lastName.trim().length > 0,
    [form.firstName, form.lastName],
  );

  // ── Fetch profile ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading) return;
    api.get<AdminProfile>(ADMIN_API.PROFILE_GET)
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setForm({ firstName: res.data.firstName, lastName: res.data.lastName });
        }
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Failed to load profile.'))
      .finally(() => setFetching(false));
  }, [authLoading]);

  // ── General Info handlers ─────────────────────────────────────────────────

  const startEdit = () => {
    if (profile) setForm({ firstName: profile.firstName, lastName: profile.lastName });
    setInfoErrors({});
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (profile) setForm({ firstName: profile.firstName, lastName: profile.lastName });
    setInfoErrors({});
    setEditMode(false);
  };

  const handleInfoChange =
    (field: 'firstName' | 'lastName') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setInfoErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const saveInfo = async () => {
    const errs: InfoErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required.';
    if (Object.keys(errs).length > 0) { setInfoErrors(errs); return; }

    setInfoSaving(true);
    try {
      const res = await api.put(ADMIN_API.PROFILE_PUT, {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
      });
      setProfile((prev) =>
        prev ? { ...prev, firstName: form.firstName.trim(), lastName: form.lastName.trim() } : prev,
      );
      showSuccess(res.message ?? 'Profile updated successfully.');
      setEditMode(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setInfoSaving(false);
    }
  };

  // ── Password handlers ─────────────────────────────────────────────────────

  const handlePwdChange =
    (field: keyof typeof pwdForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPwdForm((prev) => ({ ...prev, [field]: e.target.value }));
      setPwdErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const toggleShow = (field: keyof ShowPwd) =>
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }));

  const savePwd = async () => {
    const errs: PwdErrors = {};
    if (profile?.hasPassword && !pwdForm.oldPwd.trim())
      errs.oldPwd = 'Old password is required.';
    if (!pwdForm.newPwd.trim())
      errs.newPwd = 'New password is required.';
    else if (pwdForm.newPwd.length < 8)
      errs.newPwd = 'Password must be at least 8 characters.';
    if (!pwdForm.confirmPwd.trim())
      errs.confirmPwd = 'Please confirm your new password.';
    else if (pwdForm.newPwd !== pwdForm.confirmPwd)
      errs.confirmPwd = 'Passwords do not match.';
    if (Object.keys(errs).length > 0) { setPwdErrors(errs); return; }

    setPwdSaving(true);
    try {
      const res = await api.post(ADMIN_API.SET_PASSWORD, {
        password:        pwdForm.newPwd.trim(),
        confirmPassword: pwdForm.confirmPwd.trim(),
      });
      setProfile((prev) => prev ? { ...prev, hasPassword: true } : prev);
      setPwdForm({ oldPwd: '', newPwd: '', confirmPwd: '' });
      showSuccess(res.message ?? 'Password saved successfully.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save password.');
    } finally {
      setPwdSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (authLoading || fetching) {
    return (
      <div className={styles.centered}>
        <Spinner />
        Loading profile…
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{fullName}</h1>
          <p className={styles.pageSubtitle}>
            Manage your profile — update personal details, change your password, and upload a profile photo.
          </p>
        </div>
        {!editMode && (
          <Button title="Edit Profile" type="button" onClick={startEdit} className="btn-md">
            <PencilIcon size={14} />
            Edit
          </Button>
        )}
      </div>

      {/* ── General Info card ─────────────────────────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>General Info</h2>

        {/* Fields */}
        <div className={styles.fieldsGrid}>
          <InputField
            label="FIRST NAME"
            value={form.firstName}
            onChange={handleInfoChange('firstName')}
            disabled={!editMode}
            autoComplete="given-name"
            placeholder="First name"
            error={infoErrors.firstName}
          />

          <InputField
            label="LAST NAME"
            value={form.lastName}
            onChange={handleInfoChange('lastName')}
            disabled={!editMode}
            autoComplete="family-name"
            placeholder="Last name"
            error={infoErrors.lastName}
          />

          <InputField
            label="EMAIL"
            value={profile?.email ?? ''}
            disabled
            autoComplete="email"
            placeholder="—"
          />

        </div>

        {/* Edit-mode footer */}
        {editMode && (
          <div className={styles.cardFooter}>
            <Button title="Cancel" variant="ghost" type="button" onClick={cancelEdit} disabled={infoSaving}>
              Cancel
            </Button>
            <Button title="Save Profile"
              type="button"
              loading={infoSaving}
              disabled={!isInfoValid || infoSaving}
              onClick={saveInfo}
              className='btn-md'
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* ── Security card ─────────────────────────────────────────────── */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Security</h2>

        <div className={styles.fieldsGrid}>

          {/* Old Password — only shown when a password already exists */}
          {profile?.hasPassword && (
            <InputField
              label="OLD PASSWORD"
              type={showPwd.oldPwd ? 'text' : 'password'}
              value={pwdForm.oldPwd}
              onChange={handlePwdChange('oldPwd')}
              placeholder="Enter Old Password"
              autoComplete="current-password"
              error={pwdErrors.oldPwd}
              suffix={
                <button className={styles.eyeBtn} type="button" onClick={() => toggleShow('oldPwd')} aria-label={showPwd.oldPwd ? 'Hide password' : 'Show password'}>
                  {showPwd.oldPwd ? <EyeOpenIcon /> : <EyeOffIcon />}
                </button>
              }
            />
          )}

          <InputField
            label="NEW PASSWORD"
            type={showPwd.newPwd ? 'text' : 'password'}
            value={pwdForm.newPwd}
            onChange={handlePwdChange('newPwd')}
            placeholder="Enter New Password"
            autoComplete="new-password"
            error={pwdErrors.newPwd}
            suffix={
              <button className={styles.eyeBtn} type="button" onClick={() => toggleShow('newPwd')} aria-label={showPwd.newPwd ? 'Hide password' : 'Show password'}>
                {showPwd.newPwd ? <EyeOpenIcon /> : <EyeOffIcon />}
              </button>
            }
          />

          <InputField
            label="CONFIRM PASSWORD"
            type={showPwd.confirmPwd ? 'text' : 'password'}
            value={pwdForm.confirmPwd}
            onChange={handlePwdChange('confirmPwd')}
            placeholder="Confirm New Password"
            autoComplete="new-password"
            error={pwdErrors.confirmPwd}
            suffix={
              <button className={styles.eyeBtn} type="button" onClick={() => toggleShow('confirmPwd')} aria-label={showPwd.confirmPwd ? 'Hide password' : 'Show password'}>
                {showPwd.confirmPwd ? <EyeOpenIcon /> : <EyeOffIcon />}
              </button>
            }
          />

        </div>

        {/* Password footer */}
        <div className={styles.cardFooter}>
          <Button title="Save Password" type="button" loading={pwdSaving} disabled={pwdSaving} onClick={savePwd} className='btn-md'>
            {profile?.hasPassword ? 'Change Password' : 'Set Password'}
          </Button>
        </div>
      </div>

    </div>
  );
}
