import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase/client';
import { saveProfileName } from '../../services/firebase/profileService';
import { useStore } from '../../store';

export function useProfile() {
  const navigate = useNavigate();

  const user = auth.currentUser;
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [name, setName] = React.useState(currentUser?.name || user?.displayName || '');
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');

  async function handleLogout() {
    await auth.signOut();
    navigate('/');
  }

  async function handleSaveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!user || !currentUser || !trimmedName) return;

    setIsSaving(true);
    setMessage('');

    try {
      await saveProfileName(user, currentUser, trimmedName);

      setCurrentUser({ ...currentUser, name: trimmedName });
      setIsEditingName(false);
      setMessage('Name updated successfully.');
    } catch (error) {
      console.error(error);
      setMessage('Could not update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return { navigate, user, currentUser, name, setName, isEditingName, setIsEditingName, isSaving, message, setMessage, handleSaveName, handleLogout };
}
