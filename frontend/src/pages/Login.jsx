import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import LoginIllustration from "../component/LoginIllustration";
import { login as loginUser, getGoogleAuthUrl } from "../services/authApi";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      setLoading(true);

  const res = await loginUser({
      email: email.trim(),
      password,
    });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/dashboard");
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const verificationEmail =
        err.response?.data?.email ||
        email.trim().toLowerCase();

      if (
        status === 403 &&
        code === "EMAIL_NOT_VERIFIED"
      ) {
        sessionStorage.setItem(
          "verificationEmail",
          verificationEmail
        );

        navigate("/verify-email", {
          state: {
            email: verificationEmail,
            message:
              "Verify your email before signing in.",
          },
        });

        return;
      }

      alert(
        err.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-950 pt-20">
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-80px)]">
        <div className="hidden lg:flex flex-col justify-center items-center px-10">
          <LoginIllustration />

          <h1 className="text-white text-5xl font-bold mt-8">
            Welcome Back
          </h1>

          <p className="text-gray-300 mt-5 max-w-md text-center leading-8">
            Login to continue analyzing your resume with AI-powered ATS scoring
            and job matching.
          </p>
        </div>

        <div className="flex justify-center items-center p-10">
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10"
          >
            <h2 className="text-white text-4xl font-bold">Login</h2>

            <p className="text-gray-300 mt-2">
              Access your resume dashboard.
            </p>

            <div className="relative mt-8">
              <Mail className="absolute left-4 top-4 text-white" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 text-white placeholder:text-gray-300 outline-none focus:border-indigo-400"
              />
            </div>

            <div className="relative mt-5">
              <Lock className="absolute left-4 top-4 text-white" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-gray-300 outline-none focus:border-indigo-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-white"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-8 rounded-xl py-4 text-white font-semibold transition ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Signing In..." : "Login"}
            </button>

            <div className="flex items-center my-8">
              <hr className="flex-1 border-white/20" />
              <span className="mx-4 text-gray-300">OR</span>
              <hr className="flex-1 border-white/20" />
            </div>

            <a
              href={getGoogleAuthUrl()}
              className="w-full block bg-white rounded-xl py-4 font-semibold hover:bg-gray-100 transition text-center"
            >
              Continue with Google
            </a>
            
              <div className="mt-3 flex justify-end">
  <Link
    to="/forgot-password"
    className="text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
  >
    Forgot password?
  </Link>
</div>

            <p className="text-center text-gray-300 mt-8">
              Don&apos;t have an account?
              <Link
                to="/register"
                className="text-indigo-400 ml-2 font-semibold"
              >
                Register
              </Link>
            </p>
            
          </motion.form>
        </div>
      </div>
    </div>
  );
}

export default Login;