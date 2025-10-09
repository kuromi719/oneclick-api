// app/dashboard/home/page.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Zap,
    Database,
    Code,
    TrendingUp,
    Shield,
    Activity,
    Plus,
    ArrowRight,
    Workflow,
    Clock,
    Rocket,
    BarChart,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stat {
    label: string;
    value: string;
    icon: string;
    gradient: string;
    iconBg: string;
}

interface Project {
    id: string;
    name: string;
    endpoints: number;
    requests: string;
    status: string;
    lastUsed: string;
    color: string;
    slug: string;
    description: string | null;
    icon: string | null;
}

export default function DashboardHomePage() {
    const [stats, setStats] = useState<Stat[]>([]);
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const statsResponse = await fetch('/api/dashboard/stats');
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData.stats || []);
                }

                const projectsResponse = await fetch('/api/dashboard/projects');
                if (projectsResponse.ok) {
                    const projectsData = await projectsResponse.json();
                    setRecentProjects(projectsData.projects || []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const quickActions = [
        {
            label: "Create Project",
            description: "Start building your API",
            icon: Plus,
            gradient: "from-rose-500 to-pink-600",
            href: "/dashboard/projects"
        },
        {
            label: "Visual Builder",
            description: "Design API flows",
            icon: Workflow,
            gradient: "from-purple-500 to-violet-600",
            href: "/dashboard/builder"
        },
        {
            label: "Analytics",
            description: "View insights",
            icon: BarChart,
            gradient: "from-blue-500 to-cyan-600",
            href: "/dashboard/analytics"
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 sm:mb-12"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30"
                                >
                                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </motion.div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                                    Welcome Back
                                </h1>
                            </div>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 ml-0 sm:ml-14">
                                Build and manage your APIs with visual tools
                            </p>
                        </div>
                        <Link href="/dashboard/projects">
                            <Button
                                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/30 w-full sm:w-auto"
                                size="lg"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Project
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    {stats.map((stat, index) => {
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card className="group relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    {stat.label}
                                                </p>
                                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {stat.value}
                                                </h3>
                                            </div>
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                <i className={`${stat.icon} text-2xl bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-8 sm:mb-12"
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.div
                                    key={action.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Link href={action.href}>
                                        <Card className="group cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                            <CardContent className="p-6 sm:p-8">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                                                            {action.label}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Recent Projects
                        </h2>
                        <Link href="/dashboard/projects">
                            <Button
                                variant="ghost"
                                className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 w-full sm:w-auto"
                            >
                                View All
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-4 sm:gap-6">
                        {recentProjects.length === 0 ? (
                            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                <CardContent className="p-12 text-center">
                                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        No Projects Yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Create your first project to get started
                                    </p>
                                    <Link href="/dashboard/projects">
                                        <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Project
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            recentProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <Link href={`/dashboard/projects/${project.slug}`}>
                                        <Card className="group cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-xl transition-all duration-300">
                                            <CardContent className="p-4 sm:p-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${project.color === 'rose' ? 'from-rose-500 to-pink-600' :
                                                        project.color === 'purple' ? 'from-purple-500 to-violet-600' :
                                                            project.color === 'blue' ? 'from-blue-500 to-cyan-600' :
                                                                project.color === 'green' ? 'from-green-500 to-emerald-600' :
                                                                    project.color === 'amber' ? 'from-amber-500 to-orange-600' :
                                                                        'from-pink-500 to-rose-600'
                                                        } flex items-center justify-center shadow-lg flex-shrink-0`}>
                                                        <Database className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors truncate">
                                                            {project.name}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {project.endpoints} endpoints
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {project.requests} requests
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                {project.lastUsed}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                                                        <div className={`px-3 py-1.5 rounded-full ${project.status === 'active'
                                                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                            : 'bg-gray-500/10 border border-gray-500/20'
                                                            }`}>
                                                            <span className={`text-xs font-semibold ${project.status === 'active'
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : 'text-gray-600 dark:text-gray-400'
                                                                }`}>
                                                                {project.status === 'active' ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400"
                                                        >
                                                            <ArrowRight className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}