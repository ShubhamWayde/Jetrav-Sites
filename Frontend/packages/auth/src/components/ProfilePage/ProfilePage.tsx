'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { showError, showSuccess } from '../../utils/toast';
import Button from '@repo/ui/Button';
import Spinner from '@repo/ui/Spinner';
import InputField from '@repo/ui/InputField';
import { Icon, Edit } from '@repo/ui/icon';
import styles from './ProfilePage.module.css';

// Eye / eye-off toggle icon for password fields (not in the shared icon set)
function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  hasPassword: boolean;
}

type InfoErrors = { firstName?: string; lastName?: string };
type PwdErrors = { oldPwd?: string; newPwd?: string; confirmPwd?: string };
type ShowPwd = { oldPwd: boolean; newPwd: boolean; confirmPwd: boolean };

export interface ProfilePageProps {
  /** GET endpoint for fetching the profile  */
  profileGetUrl: string;
  /** PUT endpoint for updating name fields   */
  profilePutUrl: string;
  /** POST endpoint for setting/changing password */
  setPasswordUrl: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// ── Component ──────────────────────────────────────────────────────────────────

export default function ProfilePage({
  profileGetUrl,
  profilePutUrl,
  setPasswordUrl,
}: ProfilePageProps) {
  const { isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fetching, setFetching] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '' });
  const [infoErrors, setInfoErrors] = useState<InfoErrors>({});
  const [infoSaving, setInfoSaving] = useState(false);

  const [pwdForm, setPwdForm] = useState({ oldPwd: '', newPwd: '', confirmPwd: '' });
  const [pwdErrors, setPwdErrors] = useState<PwdErrors>({});
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd, setShowPwd] = useState<ShowPwd>({
    oldPwd: false,
    newPwd: false,
    confirmPwd: false,
  });

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : '—';

  const isInfoValid = useMemo(
    () => form.firstName.trim().length > 0 && form.lastName.trim().length > 0,
    [form.firstName, form.lastName],
  );

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading) return;
    api
      .get<Profile>(profileGetUrl)
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setForm({ firstName: res.data.firstName, lastName: res.data.lastName });
        }
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Failed to load profile.'))
      .finally(() => setFetching(false));
  }, [authLoading, profileGetUrl]);

  // ── General Info ──────────────────────────────────────────────────────────

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
    (field: 'firstName' | 'lastName') => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setInfoErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const saveInfo = async () => {
    const errs: InfoErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (Object.keys(errs).length > 0) {
      setInfoErrors(errs);
      return;
    }

    setInfoSaving(true);
    try {
      const res = await api.put(profilePutUrl, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
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

  // ── Password ──────────────────────────────────────────────────────────────

  const handlePwdChange =
    (field: keyof typeof pwdForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPwdForm((prev) => ({ ...prev, [field]: e.target.value }));
      setPwdErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const toggleShow = (field: keyof ShowPwd) =>
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }));

  const savePwd = async () => {
    const errs: PwdErrors = {};
    if (profile?.hasPassword && !pwdForm.oldPwd.trim()) errs.oldPwd = 'Old password is required.';
    if (!pwdForm.newPwd.trim()) errs.newPwd = 'New password is required.';
    else if (pwdForm.newPwd.length < 8) errs.newPwd = 'Password must be at least 8 characters.';
    if (!pwdForm.confirmPwd.trim()) errs.confirmPwd = 'Please confirm your new password.';
    else if (pwdForm.newPwd !== pwdForm.confirmPwd) errs.confirmPwd = 'Passwords do not match.';
    if (Object.keys(errs).length > 0) {
      setPwdErrors(errs);
      return;
    }

    setPwdSaving(true);
    try {
      // Send passwords exactly as typed (no trim) — the server verifies oldPassword
      const res = await api.post(setPasswordUrl, {
        oldPassword: pwdForm.oldPwd,
        password: pwdForm.newPwd,
        confirmPassword: pwdForm.confirmPwd,
      });
      setProfile((prev) => (prev ? { ...prev, hasPassword: true } : prev));
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
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{fullName}</h1>
          <p className={styles.pageSubtitle}>
            Manage your profile — update personal details and change your password.
          </p>
        </div>
        {!editMode && (
          <Button title="Edit Profile" type="button" onClick={startEdit}>
            <Icon icon={Edit} size="sm" />
            Edit
          </Button>
        )}
      </div>

      {/* General Info */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>General Info</h2>

        <div className={styles.fieldsGrid}>
          <InputField
            label="First name"
            value={form.firstName}
            onChange={handleInfoChange('firstName')}
            disabled={!editMode}
            autoComplete="given-name"
            placeholder="First name"
            error={infoErrors.firstName}
          />
          <InputField
            label="Last name"
            value={form.lastName}
            onChange={handleInfoChange('lastName')}
            disabled={!editMode}
            autoComplete="family-name"
            placeholder="Last name"
            error={infoErrors.lastName}
          />
          <InputField
            label="Email"
            value={profile?.email ?? ''}
            disabled
            autoComplete="email"
            placeholder="—"
          />
        </div>

        {editMode && (
          <div className={styles.cardFooter}>
            <Button
              title="Cancel"
              variant="ghost"
              type="button"
              onClick={cancelEdit}
              disabled={infoSaving}
            >
              Cancel
            </Button>
            <Button
              title="Save Profile"
              type="button"
              loading={infoSaving}
              disabled={!isInfoValid || infoSaving}
              onClick={saveInfo}
             
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Security */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Security</h2>

        <div className={styles.fieldsGrid}>
          {profile?.hasPassword && (
            <InputField
              label="Current password"
              type={showPwd.oldPwd ? 'text' : 'password'}
              value={pwdForm.oldPwd}
              onChange={handlePwdChange('oldPwd')}
              placeholder="Enter Old Password"
              autoComplete="current-password"
              error={pwdErrors.oldPwd}
              suffix={
                <button
                  className={styles.eyeBtn}
                  type="button"
                  onClick={() => toggleShow('oldPwd')}
                  aria-label={showPwd.oldPwd ? 'Hide password' : 'Show password'}
                  aria-pressed={showPwd.oldPwd}
                >
                  <EyeIcon off={showPwd.oldPwd} />
                </button>
              }
            />
          )}

          <InputField
            label="New password"
            type={showPwd.newPwd ? 'text' : 'password'}
            value={pwdForm.newPwd}
            onChange={handlePwdChange('newPwd')}
            placeholder="Enter New Password"
            autoComplete="new-password"
            error={pwdErrors.newPwd}
            suffix={
              <button
                className={styles.eyeBtn}
                type="button"
                onClick={() => toggleShow('newPwd')}
                aria-label={showPwd.newPwd ? 'Hide password' : 'Show password'}
                  aria-pressed={showPwd.newPwd}
              >
                <EyeIcon off={showPwd.newPwd} />
              </button>
            }
          />

          <InputField
            label="Confirm new password"
            type={showPwd.confirmPwd ? 'text' : 'password'}
            value={pwdForm.confirmPwd}
            onChange={handlePwdChange('confirmPwd')}
            placeholder="Confirm New Password"
            autoComplete="new-password"
            error={pwdErrors.confirmPwd}
            suffix={
              <button
                className={styles.eyeBtn}
                type="button"
                onClick={() => toggleShow('confirmPwd')}
                aria-label={showPwd.confirmPwd ? 'Hide password' : 'Show password'}
                  aria-pressed={showPwd.confirmPwd}
              >
                <EyeIcon off={showPwd.confirmPwd} />
              </button>
            }
          />
        </div>

        <div className={styles.cardFooter}>
          <Button
            title="Save Password"
            type="button"
            loading={pwdSaving}
            disabled={pwdSaving}
            onClick={savePwd}
           
          >
            {profile?.hasPassword ? 'Change Password' : 'Set Password'}
          </Button>
        </div>
      </div>
    </div>
  );
}
