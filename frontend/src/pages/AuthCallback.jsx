import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    // Prevent React StrictMode from processing the callback twice
    if (handled.current) return;
    handled.current = true;

    const hashParams = new URLSearchParams(
      window.location.hash.substring(1)
    );

    const token = hashParams.get("token");
    const id = hashParams.get("id");
    const name = hashParams.get("name");
    const email = hashParams.get("email");

    // Remove the token from the visible browser URL
    window.history.replaceState(
      null,
      document.title,
      window.location.pathname
    );

    if (!token || !id || !email) {
      toast.error("Invalid Google authentication response.");
      navigate("/login", { replace: true });
      return;
    }

    login(token, {
      id,
      name: name || "Google User",
      email,
    });

    toast.success("Signed in with Google!");
    navigate("/dashboard", { replace: true });
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

        <h2 className="text-2xl font-bold">
          Completing sign-in...
        </h2>

        <p className="mt-2 text-slate-400">
          Please wait while we securely sign you in.
        </p>
      </div>
    </div>
  );
}

export default AuthCallback;