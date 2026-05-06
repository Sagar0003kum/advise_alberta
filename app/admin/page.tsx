"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import DarkModeToggle from "../components/DarkModeToggle";

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "15" }}>
          {icon}
        </div>
      </div>
      <p className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800 dark:text-white">{value}</p>
      {sub && <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function TableRow({ cells, header }: { cells: any[]; header?: boolean }) {
  return (
    <tr className={header ? "bg-surface-50 dark:bg-slate-700/50" : "hover:bg-surface-50 dark:hover:bg-slate-700/30 transition-colors"}>
      {cells.map((cell, i) => {
        const Tag = header ? "th" : "td";
        return (
          <Tag key={i} className={`px-4 py-2.5 text-left border-b border-surface-100 dark:border-slate-700 ${header ? "text-[11px] font-body font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500" : "text-sm font-body text-slate-600 dark:text-slate-300"}`}>
            {cell}
          </Tag>
        );
      })}
    </tr>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [stats, setStats] = useState({ users: 0, alerts: 0, searches: 0 });
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    setLoadingData(true);
    try {
      // Fetch users
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(usersData);

      // Fetch alerts
      const alertsSnap = await getDocs(collection(db, "alerts"));
      const alertsData = alertsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAlerts(alertsData);

      // Compute stats
      setStats({
        users: usersData.length,
        alerts: alertsData.filter((a) => a.active).length,
        searches: alertsData.length, // approximate
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoadingData(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-surface-200 dark:border-slate-700 max-w-sm">
          <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-2">Admin Access Required</h1>
          <p className="font-body text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in with your Google account to access the dashboard.</p>
          <a href="/" className="font-body text-sm text-primary hover:underline">← Back to AdviseAlberta</a>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-surface-200 dark:border-slate-700 max-w-sm">
          <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-xl text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="font-body text-sm text-slate-500 dark:text-slate-400 mb-6">You don't have admin permissions. Only administrators can access this page.</p>
          <a href="/" className="font-body text-sm text-primary hover:underline">← Back to AdviseAlberta</a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "alerts", label: "Email Alerts" },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900 transition-colors">
      {/* Admin Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-800 border-b border-surface-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-extrabold text-sm" style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>A</div>
            <span className="font-display font-bold text-sm text-slate-800 dark:text-white">AdviseAlberta</span>
          </a>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-md tracking-wider">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <div className="flex items-center gap-2">
            {user.photoURL && <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />}
            <span className="text-xs font-body text-slate-500 dark:text-slate-400 hidden sm:block">{user.displayName}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white">Admin Dashboard</h1>
            <p className="font-body text-sm text-slate-400 dark:text-slate-500 mt-0.5">Monitor usage, manage users, and track alerts</p>
          </div>
          <button onClick={loadDashboardData} disabled={loadingData}
            className="text-xs font-body font-semibold text-primary hover:text-primary-dark dark:text-primary-light px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary/40 transition-all disabled:opacity-50">
            {loadingData ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-xs font-body font-semibold transition-all ${activeTab === tab.id ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Users" value={stats.users} sub="Registered accounts" color="#0D9488"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} />
              <StatCard label="Active Alerts" value={stats.alerts} sub="Email subscriptions" color="#2563EB"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>} />
              <StatCard label="Programs Tracked" value="51" sub="In verified database" color="#F59E0B"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>} />
            </div>

            {/* Recent searches from alerts */}
            <div className="bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-surface-200 dark:border-slate-700">
                <h2 className="font-display font-bold text-sm text-slate-800 dark:text-white">Recent Search Alerts</h2>
              </div>
              {alerts.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <TableRow header cells={["Query", "User", "Programs", "Date"]} />
                  </thead>
                  <tbody>
                    {alerts.slice(0, 10).map((alert, i) => (
                      <TableRow key={i} cells={[
                        alert.query || "—",
                        alert.email || "Anonymous",
                        (alert.programs?.length || 0) + " programs",
                        alert.createdAt?.toDate?.()?.toLocaleDateString() || "—",
                      ]} />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="font-body text-sm text-slate-400 dark:text-slate-500">No alerts yet. Users will appear here when they subscribe.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-slate-800 dark:text-white">Registered Users ({users.length})</h2>
            </div>
            {users.length > 0 ? (
              <table className="w-full">
                <thead>
                  <TableRow header cells={["User", "Email", "Role", "Last Login"]} />
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <TableRow key={i} cells={[
                      <div className="flex items-center gap-2">
                        {u.photoURL ? <img src={u.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" /> : <div className="w-6 h-6 rounded-full bg-primary/20" />}
                        <span className="font-semibold">{u.displayName || "—"}</span>
                      </div>,
                      u.email || "—",
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${u.role === "admin" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-surface-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                        {u.role || "user"}
                      </span>,
                      u.lastLogin?.toDate?.()?.toLocaleDateString() || "—",
                    ]} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="font-body text-sm text-slate-400 dark:text-slate-500">No users registered yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="bg-white dark:bg-slate-800 border border-surface-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-200 dark:border-slate-700">
              <h2 className="font-display font-bold text-sm text-slate-800 dark:text-white">Email Alert Subscriptions ({alerts.length})</h2>
            </div>
            {alerts.length > 0 ? (
              <table className="w-full">
                <thead>
                  <TableRow header cells={["Email", "Search Query", "Programs", "Status", "Created"]} />
                </thead>
                <tbody>
                  {alerts.map((a, i) => (
                    <TableRow key={i} cells={[
                      a.email || "—",
                      a.query || "—",
                      (a.programs?.length || 0).toString(),
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${a.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-surface-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                        {a.active ? "Active" : "Inactive"}
                      </span>,
                      a.createdAt?.toDate?.()?.toLocaleDateString() || "—",
                    ]} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="font-body text-sm text-slate-400 dark:text-slate-500">No alert subscriptions yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}