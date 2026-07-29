import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  FileText,
  RefreshCw,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

import DashboardLayout from "../component/DashboardLayout";
import ProfileHeader from "../component/profile/ProfileHeader";
import ActivityTimeline from "../component/profile/ActivityTimeline";
import ATSProgress from "../component/profile/ATSProgress";
import RecentResumeCard from "../component/profile/RecentResumeCard";

import {
  getProfile,
} from "../services/profileApi";

function ProfileStat({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  delay,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
      }}
      whileHover={{
        y: -5,
      }}
      className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={22} />
        </div>

        <Sparkles
          size={17}
          className="text-slate-300"
        />
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-black text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}

function LoadingProfile() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl animate-pulse space-y-7">
        <div className="h-56 rounded-3xl bg-white/50" />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 rounded-2xl bg-white/50"
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-3xl bg-white/50 lg:col-span-2" />
          <div className="h-96 rounded-3xl bg-white/50" />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileError({
  message,
  onRetry,
}) {
  return (
    <DashboardLayout>
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="liquid-glass max-w-md rounded-3xl p-8 text-center"
        >
          <div className="liquid-logo mx-auto flex h-16 w-16 items-center justify-center text-white">
            <UserRound
              size={29}
              className="relative z-10"
            />
          </div>

          <h2 className="mt-6 text-2xl font-black text-slate-900">
            Profile unavailable
          </h2>

          <p className="mt-3 text-slate-500">
            {message}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function Profile() {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await getProfile();

      setProfile(data);
    } catch (requestError) {
      console.error(
        "Profile load error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const statistics = useMemo(() => {
    const totalResumes =
      Number(profile?.totalResumes) || 0;

    const highestATS =
      Number(profile?.highestATS) || 0;

    const averageATS =
      Number(profile?.averageATS) || 0;

    const joinedDate = profile?.createdAt
      ? new Date(
          profile.createdAt
        ).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : "N/A";

    return {
      totalResumes,
      highestATS,
      averageATS,
      joinedDate,
    };
  }, [profile]);

  if (loading) {
    return <LoadingProfile />;
  }

  if (error) {
    return (
      <ProfileError
        message={error}
        onRetry={fetchProfile}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-7">
        <motion.header
          initial={{
            opacity: 0,
            y: -18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="liquid-glass rounded-3xl p-3 sm:p-4"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-3 px-4 pt-3">
              <div className="liquid-logo flex h-11 w-11 items-center justify-center text-white">
                <UserRound
                  size={22}
                  className="relative z-10"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Account overview
                </p>

                <h1 className="text-xl font-black text-slate-900">
                  Your Profile
                </h1>
              </div>
            </div>

            <ProfileHeader
              profile={profile}
            />
          </div>
        </motion.header>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <ProfileStat
            title="Total Resumes"
            value={
              statistics.totalResumes
            }
            description="Saved resume analyses"
            icon={FileText}
            iconClass="bg-indigo-100 text-indigo-600"
            delay={0.05}
          />

          <ProfileStat
            title="Highest ATS"
            value={`${statistics.highestATS}%`}
            description="Best recorded ATS score"
            icon={Trophy}
            iconClass="bg-emerald-100 text-emerald-600"
            delay={0.1}
          />

          <ProfileStat
            title="Average ATS"
            value={`${statistics.averageATS}%`}
            description="Average across all resumes"
            icon={BarChart3}
            iconClass="bg-violet-100 text-violet-600"
            delay={0.15}
          />

          <ProfileStat
            title="Member Since"
            value={statistics.joinedDate}
            description="ResumeAI account created"
            icon={Calendar}
            iconClass="bg-amber-100 text-amber-600"
            delay={0.2}
          />
        </section>

        <motion.section
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.23,
          }}
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-3xl bg-white/90 shadow-sm backdrop-blur-xl">
              <ActivityTimeline
                activities={
                  profile?.activities || []
                }
              />
            </div>

            <div className="overflow-hidden rounded-3xl bg-white/90 shadow-sm backdrop-blur-xl">
              <RecentResumeCard
                resumes={
                  profile?.recentResumes || []
                }
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/90 shadow-sm backdrop-blur-xl">
            <ATSProgress
              value={
                statistics.highestATS
              }
            />
          </div>
        </motion.section>
      </div>
    </DashboardLayout>
  );
}