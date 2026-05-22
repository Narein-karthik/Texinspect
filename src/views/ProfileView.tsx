import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function ProfileView() {

  const navigate = useNavigate();

  const user = auth.currentUser;

  async function handleLogout() {
    await auth.signOut();
    navigate('/');
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

          <h1 className="text-2xl font-black mt-4 text-gray-900">
            {user?.displayName || 'TexInspect User'}
          </h1>

          <p className="text-gray-500 mt-1">
            {user?.email}
          </p>

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