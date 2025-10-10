"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Code,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Play,
    Pause,
    Activity,
    Clock,
    Database,
    ArrowUpRight,
    BarChart3,
    Zap,
    TrendingUp,
    AlertCircle,
    Check,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Endpoint {
    id: string;
    name: string;
    path: string;
    method: string;
    description: string | null;
    isActive: boolean;
    project: {
        id: string;
        name: string;
        slug: string;
        color: string;
    };
    totalRequests: number;
    last24hRequests: number;
    avgDuration: number;
    createdAt: string;
    updatedAt: string;
}

export default function EndpointsPage() {
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [filteredEndpoints, setFilteredEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [methodFilter, setMethodFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [projectFilter, setProjectFilter] = useState<string>("all");

    const methods = [
        { value: "GET", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-500/10" },
        { value: "POST", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-500/10" },
        { value: "PUT", color: "bg-amber-500", textColor: "text-amber-600", bgLight: "bg-amber-500/10" },
        { value: "DELETE", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-500/10" },
        { value: "PATCH", color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-500/10" },
    ];

    useEffect(() => {
        fetchEndpoints();
    }, []);

    useEffect(() => {
        filterEndpoints();
    }, [endpoints, searchQuery, methodFilter, statusFilter, projectFilter]);

    const fetchEndpoints = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/endpoints');
            if (response.ok) {
                const data = await response.json();
                setEndpoints(data.endpoints);
            }
        } catch (error) {
            console.error('Error fetching endpoints:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEndpoints = () => {
        let filtered = [...endpoints];

        if (searchQuery) {
            filtered = filtered.filter(endpoint =>
                endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                endpoint.project.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (methodFilter !== "all") {
            filtered = filtered.filter(endpoint => endpoint.method === methodFilter);
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(endpoint =>
                statusFilter === "active" ? endpoint.isActive : !endpoint.isActive
            );
        }

        if (projectFilter !== "all") {
            filtered = filtered.filter(endpoint => endpoint.project.id === projectFilter);
        }

        setFilteredEndpoints(filtered);
    };

    const toggleEndpointStatus = async (endpointId: string, isActive: boolean) => {
        try {
            await fetch(`/api/dashboard/endpoints/${endpointId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive })
            });
            fetchEndpoints();
        } catch (error) {
            console.error('Error toggling endpoint:', error);
        }
    };

    const deleteEndpoint = async (endpointId: string) => {
        if (!confirm('Are you sure you want to delete this endpoint?')) return;

        try {
            await fetch(`/api/dashboard/endpoints/${endpointId}`, {
                method: 'DELETE'
            });
            fetchEndpoints();
        } catch (error) {
            console.error('Error deleting endpoint:', error);
        }
    };

    const uniqueProjects = Array.from(new Set(endpoints.map(e => e.project.id)))
        .map(id => endpoints.find(e => e.project.id === id)!.project);

    const stats = {
        total: endpoints.length,
        active: endpoints.filter(e => e.isActive).length,
        inactive: endpoints.filter(e => !e.isActive).length,
        totalRequests: endpoints.reduce((sum, e) => sum + e.totalRequests, 0),
        last24h: endpoints.reduce((sum, e) => sum + e.last24hRequests, 0),
        avgDuration: endpoints.length > 0
            ? Math.round(endpoints.reduce((sum, e) => sum + e.avgDuration, 0) / endpoints.length)
            : 0
    };

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
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                                API Endpoints
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                                Manage and monitor all your API endpoints
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <CardContent className="p-6 relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                            <Code className="w-6 h-6 text-white" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Total Endpoints
                                    </p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                                        {stats.total}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <CardContent className="p-6 relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                            <Check className="w-6 h-6 text-white" />
                                        </div>
                                        <Activity className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Active
                                    </p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                                        {stats.active}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <CardContent className="p-6 relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <BarChart3 className="w-6 h-6 text-white" />
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Requests (24h)
                                    </p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                                        {stats.last24h.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <CardContent className="p-6 relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <Clock className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Avg Response
                                    </p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                                        {stats.avgDuration}ms
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        placeholder="Search endpoints..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                                        <SelectTrigger className="w-[140px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                                            <Filter className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods</SelectItem>
                                            {methods.map(method => (
                                                <SelectItem key={method.value} value={method.value}>
                                                    {method.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                                            <Activity className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                                        <SelectTrigger className="w-[180px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50">
                                            <Database className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Projects</SelectItem>
                                            {uniqueProjects.map(project => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredEndpoints.map((endpoint, index) => {
                                const methodData = methods.find(m => m.value === endpoint.method);
                                return (
                                    <motion.div
                                        key={endpoint.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-lg transition-all duration-300 group">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center flex-wrap gap-3">
                                                            <Badge className={`${methodData?.color} text-white font-bold px-3 py-1`}>
                                                                {endpoint.method}
                                                            </Badge>
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                                {endpoint.name}
                                                            </h3>
                                                            <Badge variant={endpoint.isActive ? "default" : "secondary"} className={endpoint.isActive ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20" : "bg-gray-500/10 text-gray-600 dark:text-gray-400"}>
                                                                {endpoint.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                href={`/dashboard/projects/${endpoint.project.slug}`}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                            >
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: endpoint.project.color }}
                                                                />
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {endpoint.project.name}
                                                                </span>
                                                            </Link>
                                                        </div>

                                                        <code className="block px-4 py-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                                                            {endpoint.path}
                                                        </code>

                                                        {endpoint.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {endpoint.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-6 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <BarChart3 className="w-4 h-4 text-purple-500" />
                                                                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                                                <span className="font-bold text-gray-900 dark:text-white">
                                                                    {endpoint.totalRequests.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Activity className="w-4 h-4 text-green-500" />
                                                                <span className="text-gray-600 dark:text-gray-400">24h:</span>
                                                                <span className="font-bold text-gray-900 dark:text-white">
                                                                    {endpoint.last24hRequests.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex lg:flex-col gap-2">
                                                        <Link href={`/dashboard/builder?endpoint=${endpoint.id}`}>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="hover:bg-blue-500/10 hover:text-blue-500"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => toggleEndpointStatus(endpoint.id, endpoint.isActive)}
                                                            className={endpoint.isActive ? 'hover:bg-amber-500/10 hover:text-amber-500' : 'hover:bg-green-500/10 hover:text-green-500'}
                                                        >
                                                            {endpoint.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => deleteEndpoint(endpoint.id)}
                                                            className="hover:bg-red-500/10 hover:text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {filteredEndpoints.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                    <CardContent className="p-12 text-center">
                                        {searchQuery || methodFilter !== "all" || statusFilter !== "all" || projectFilter !== "all" ? (
                                            <>
                                                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                    No Endpoints Found
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                    Try adjusting your filters or search query
                                                </p>
                                                <Button
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setMethodFilter("all");
                                                        setStatusFilter("all");
                                                        setProjectFilter("all");
                                                    }}
                                                    variant="outline"
                                                    className="border-gray-300 dark:border-gray-700"
                                                >
                                                    Clear Filters
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                    No Endpoints Yet
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                    Create your first endpoint in a project to get started
                                                </p>
                                                <Link href="/dashboard/projects">
                                                    <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
                                                        Go to Projects
                                                    </Button>
                                                </Link>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}