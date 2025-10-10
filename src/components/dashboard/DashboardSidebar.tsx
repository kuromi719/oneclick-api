"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Home,
    Sparkles,
    LogOut,
    Database,
    Code,
    BarChart3,
    Key,
    FileCode,
    Moon,
    Sun,
    ChevronLeft,
    ChevronRight,
    Workflow,
    ScrollText,
    Table,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "dark" | "light";
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const navItems = [
        { href: "/dashboard/home", label: "Dashboard", icon: Home },
        { href: "/dashboard/projects", label: "Projects", icon: Database },
        { href: "/dashboard/database", label: "Database Builder", icon: Table },
        { href: "/dashboard/builder", label: "Visual Builder", icon: Workflow },
        { href: "/dashboard/endpoints", label: "Endpoints", icon: Code },
        { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dashboard/docs", label: "Documentation", icon: FileCode },
        { href: "/dashboard/about", label: "About Project", icon: ScrollText },
    ];

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed left-0 top-0 h-screen border-r border-rose-500/20 bg-white dark:bg-black/80 backdrop-blur-xl transition-all duration-300 z-50 ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-rose-500/20">
                    <Link href="/dashboard/home" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="min-w-[40px] min-h-[40px] w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/30"
                        >
                            <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xl font-black whitespace-nowrap overflow-hidden"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #fda4af 0%, #fb7185 50%, #f43f5e 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    OneClick API
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start gap-3 relative ${isActive
                                            ? "bg-gradient-to-r from-rose-500/10 to-pink-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20"
                                            : "text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-300 hover:bg-rose-500/5"
                                            } ${isCollapsed ? "px-3" : "px-4"}`}
                                    >
                                        <Icon className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4"} min-w-[16px]`} />
                                        <AnimatePresence mode="wait">
                                            {!isCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        {isActive && !isCollapsed && (
                                            <motion.div
                                                layoutId="activeSidebar"
                                                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500 rounded-r-full"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                    </Button>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 space-y-2 border-t border-rose-500/20">
                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="ghost"
                            onClick={toggleTheme}
                            className={`w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-300 hover:bg-rose-500/5 ${isCollapsed ? "px-3" : "px-4"
                                }`}
                        >
                            {theme === "dark" ? (
                                <Sun className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4"} min-w-[16px]`} />
                            ) : (
                                <Moon className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4"} min-w-[16px]`} />
                            )}
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {theme === "dark" ? "Light" : "Dark"}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className={`w-full justify-start gap-3 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 ${isCollapsed ? "px-3" : "px-4"
                                }`}
                        >
                            <LogOut className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4"} min-w-[16px]`} />
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        Logout
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </motion.div>
                </div>

                <div className="p-2 border-t border-rose-500/20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-300 hover:bg-rose-500/5"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </Button>
                </div>

                <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-rose-500/50 to-transparent" />
            </div>
        </motion.aside>
    );
}
