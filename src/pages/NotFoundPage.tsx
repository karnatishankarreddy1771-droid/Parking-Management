import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl mb-6">
        <Car className="w-8 h-8" />
      </div>

      <h1 className="text-6xl font-black tracking-tight text-white">404</h1>
      <p className="mt-2 text-lg font-bold text-slate-300">Page Not Found</p>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The requested page or portal route does not exist in the Parking's application.
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};
