import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Save } from "lucide-react";

function EditProfileModal({ open, profile, onClose, onSave }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    onSave({
      name: name.trim(),
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative z-10 w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-8 shadow-2xl text-white"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white"
          >
            <X />
          </button>

          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6">
            <User size={34} />
          </div>

          <h2 className="text-3xl font-bold">Edit Profile</h2>

          <p className="text-gray-400 mt-2">
            Update your profile information.
          </p>

          <div className="mt-8">
            <label className="text-sm text-gray-300">Full Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-400"
              placeholder="Enter your name"
            />
          </div>

          <button
            type="submit"
            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
          >
            <Save size={18} />
            Save Changes
          </button>
        </motion.form>
      </div>
    </AnimatePresence>
  );
}

export default EditProfileModal;