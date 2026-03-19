"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, ShirtIcon, Sparkles, BookmarkIcon, Home, LogIn, LogOut, User, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/upload", label: "Upload", icon: Upload, auth: true },
  { href: "/wardrobe", label: "Wardrobe", icon: ShirtIcon, auth: true },
  { href: "/generate", label: "Generate", icon: Sparkles, auth: true },
  { href: "/outfits", label: "Outfits", icon: BookmarkIcon, auth: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.auth || user);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-dark-950/60 backdrop-blur-2xl"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white shadow-glow-sm transition-shadow group-hover:shadow-glow">
            f
          </div>
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            fit.ly
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ul className="flex items-center gap-0.5">
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      active
                        ? "text-white"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
                    )}
                  >
                    <Icon size={15} className={active ? "text-accent" : ""} />
                    <span className="hidden sm:inline">{label}</span>

                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-white/[0.06] shadow-inner-glow"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {user ? (
            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <User size={14} />
                <span className="hidden font-medium sm:inline">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-all hover:bg-white/[0.04] hover:text-slate-300"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={clsx(
                "flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm font-medium text-slate-400 transition-all hover:border-white/[0.15] hover:text-white",
                loading && "opacity-80"
              )}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
              <span className="hidden sm:inline">{loading ? "Loading…" : "Login"}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
    </motion.nav>
  );
}
