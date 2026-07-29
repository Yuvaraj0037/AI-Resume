import {
  lazy,
  Suspense,
} from "react";

import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./component/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
const Home = lazy(() =>
  import("./pages/Home")
);

const ResumeBuilderEditor = lazy(() =>
  import(
    "./pages/ResumeBuilderEditor"
  )
);

const Login = lazy(() =>
  import("./pages/Login")
);

const Register = lazy(() =>
  import("./pages/Register")
);

const VerifyEmail = lazy(() =>
  import("./pages/VerifyEmail")
);

const AuthCallback = lazy(() =>
  import("./pages/AuthCallback")
);

// Dashboard pages
const Dashboard = lazy(() =>
  import("./pages/Dashboard")
);

const UploadResume = lazy(() =>
  import("./pages/UploadResume")
);

const Analysis = lazy(() =>
  import("./pages/Analysis")
);

const History = lazy(() =>
  import("./pages/History")
);

const Profile = lazy(() =>
  import("./pages/Profile")
);

const Settings = lazy(() =>
  import("./pages/Settings")
);

const JobMatch = lazy(() =>
  import("./pages/JobMatch")
);

const ResumeImprove = lazy(() =>
  import("./pages/ResumeImprove")
);

const ResumeComparison = lazy(() =>
  import("./pages/ResumeComparison")
);

const ResumeBuilder = lazy(() =>
  import("./pages/ResumeBuilder")
);

const NotFound = lazy(() =>
  import("./pages/NotFound")
);

const AIResumeCoach = lazy(() =>
  import("./pages/AIResumeCoach")
);

const PrivacyPolicy = lazy(() =>
  import("./pages/PrivacyPolicy")
);

const TermsOfService = lazy(() =>
  import("./pages/TermsOfService")
);

const ForgotPassword = lazy(() =>
  import("./pages/ForgotPassword")
);

const HIDE_NAVBAR_PATHS = [
  "/dashboard",
  "/upload",
  "/analysis",
  "/history",
  "/profile",
  "/settings",
  "/compare",
  "/job-match",
  "/resume-improve",
  "/resume-builder",
  "/ai-coach",
  "/auth/callback",
  "/verify-email",
];

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="liquid-logo mx-auto flex h-14 w-14 items-center justify-center">
          <span className="relative z-10 text-xl font-black text-white">
            R
          </span>
        </div>

        <p className="mt-4 font-semibold text-slate-300">
          Loading ResumeAI...
        </p>
      </div>
    </div>
  );
}

function ProtectedPage({
  children,
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

function App() {
  const location = useLocation();

  const hideNavbar =
    HIDE_NAVBAR_PATHS.includes(
      location.pathname
    ) ||
    location.pathname.startsWith(
      "/resume-builder"
    ) ||
    location.pathname.startsWith(
      "/auth/callback"
    );

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Suspense
        fallback={<PageLoader />}
      >
        <Routes>
          {/* Public routes */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />

          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />
          <Route
           path="/terms"
          element={<TermsOfService />}
          />

          {/* Protected routes */}

          <Route
            path="/dashboard"
            element={
              <ProtectedPage>
                <Dashboard />
              </ProtectedPage>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedPage>
                <UploadResume />
              </ProtectedPage>
            }
          />

          <Route
            path="/analysis"
            element={
              <ProtectedPage>
                <Analysis />
              </ProtectedPage>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedPage>
                <History />
              </ProtectedPage>
            }
          />

          <Route
            path="/compare"
            element={
              <ProtectedPage>
                <ResumeComparison />
              </ProtectedPage>
            }
          />

          <Route
            path="/job-match"
            element={
              <ProtectedPage>
                <JobMatch />
              </ProtectedPage>
            }
          />

          <Route
            path="/resume-improve"
            element={
              <ProtectedPage>
                <ResumeImprove />
              </ProtectedPage>
            }
          />

          <Route
            path="/resume-builder"
            element={
              <ProtectedPage>
                <ResumeBuilder />
              </ProtectedPage>
            }
          />
          <Route
            path="/resume-builder/:id"
            element={
              <ProtectedPage>
                <ResumeBuilderEditor />
              </ProtectedPage>
            }
          />

          <Route
            path="/ai-coach"
            element={
            <ProtectedPage>
              <AIResumeCoach />
            </ProtectedPage>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedPage>
                <Profile />
              </ProtectedPage>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedPage>
                <Settings />
              </ProtectedPage>
            }
          />

          {/* 404 */}

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;