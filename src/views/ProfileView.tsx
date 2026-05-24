import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, LogOut, Pencil, X } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useStore } from '../store';

export default function ProfileView() {

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
      await updateProfile(user, { displayName: trimmedName });
      await setDoc(
        doc(db, 'users', user.uid),
        {
          id: user.uid,
          name: trimmedName,
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: currentUser.role,
          factoryId: currentUser.factoryId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">

      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6">

        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 font-semibold mb-6"
        >
          ← Back
        </button>

        <div className="flex flex-col items-center">

          <img
            src={user?.photoURL || 'https://i.pravatar.cc/150'}
            alt="profile"
            className="w-28 h-28 rounded-full border-4 border-blue-500"
          />

          <form onSubmit={handleSaveName} className="w-full mt-4 space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
              Display Name
            </label>

            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage('');
                  }}
                  autoFocus
                  maxLength={100}
                  className="min-w-0 flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-50"
                  aria-label="Save name"
                >
                  <Check size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setName(currentUser?.name || user?.displayName || '');
                    setIsEditingName(false);
                    setMessage('');
                  }}
                  className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center"
                  aria-label="Cancel editing name"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 text-center break-words">
                  {currentUser?.name || user?.displayName || 'TexInspect User'}
                </h1>

                <button
                  type="button"
                  onClick={() => {
                    setName(currentUser?.name || user?.displayName || '');
                    setIsEditingName(true);
                    setMessage('');
                  }}
                  className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center"
                  aria-label="Edit name"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </form>

          <p className="text-gray-500 mt-1">
            {user?.email}
          </p>

          {message && (
            <p className="text-xs font-bold text-gray-400 mt-3 text-center">
              {message}
            </p>
          )}

        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">

          <div className="bg-blue-50 p-4 rounded-2xl">
            <p className="text-sm text-gray-500">
              Defects Logged
            </p>

            <h2 className="text-3xl font-black text-blue-600">
              24
            </h2>
          </div>

          <div className="bg-green-50 p-4 rounded-2xl">
            <p className="text-sm text-gray-500">
              Rolls Completed
            </p>

            <h2 className="text-3xl font-black text-green-600">
              12
            </h2>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>

      </div>

    </div>
  );
}
