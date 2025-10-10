"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Plus,
    Database,
    Code,
    Activity,
    Settings,
    Trash2,
    Edit,
    Search,
    ArrowLeft,
    MoreVertical,
    Globe,
    Key,
    BarChart3,
    Copy,
    Check,
    ExternalLink,
    Play,
    Pause,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Endpoint {
    id: string;
    name: string;
    path: string;
    method: string;
    description: string | null;
    isActive: boolean;
    requests: number;
    avgDuration: number;
}

interface ApiKey {
    id: string;
    key: string;
    name: string;
    isActive: boolean;
    lastUsedAt: string | null;
    createdAt: string;
}

interface Project {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    endpoints: number;
    requests: string;
    activeEndpoints: number;
    apiKeys: number;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isCreateEndpointOpen, setIsCreateEndpointOpen] = useState(false);
    const [isCreateApiKeyOpen, setIsCreateApiKeyOpen] = useState(false);
    const [deleteEndpointId, setDeleteEndpointId] = useState<string | null>(null);
    const [endpointFormData, setEndpointFormData] = useState({
        name: "",
        path: "",
        method: "GET",
        description: "",
    });
    const [apiKeyFormData, setApiKeyFormData] = useState({
        name: "",
    });

    const methods = [
        { value: "GET", color: "bg-green-500" },
        { value: "POST", color: "bg-blue-500" },
        { value: "PUT", color: "bg-amber-500" },
        { value: "DELETE", color: "bg-red-500" },
        { value: "PATCH", color: "bg-purple-500" },
    ];

    useEffect(() => {
        fetchProjectData();
    }, [slug]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/dashboard/projects/s/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setProject(data.project);
                setEndpoints(data.endpoints || []);
                setApiKeys(data.apiKeys || []);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEndpoint = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/dashboard/projects/s/${slug}/endpoints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(endpointFormData)
            });

            if (response.ok) {
                setIsCreateEndpointOpen(false);
                setEndpointFormData({ name: "", path: "", method: "GET", description: "" });
                fetchProjectData();
            }
        } catch (error) {
            console.error('Error creating endpoint:', error);
        }
    };

    const handleCreateApiKey = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/dashboard/projects/s/${slug}/api-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiKeyFormData)
            });

            if (response.ok) {
                setIsCreateApiKeyOpen(false);
                setApiKeyFormData({ name: "" });
                fetchProjectData();
            }
        } catch (error) {
            console.error('Error creating API key:', error);
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleEndpointStatus = async (endpointId: string, isActive: boolean) => {
        try {
            await fetch(`/api/dashboard/endpoints/${endpointId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive })
            });
            fetchProjectData();
        } catch (error) {
            console.error('Error toggling endpoint:', error);
        }
    };

    const filteredEndpoints = endpoints.filter(endpoint =>
        endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <Card className="max-w-md w-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-rose-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Project Not Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The project you`re looking for doesn`t exist.
                        </p>
                        <Link href="/dashboard/projects">
                            <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Projects
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
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
                >
                    <div className="mb-6">
                        <Link href="/dashboard/projects">
                            <Button variant="ghost" className="mb-4 text-gray-600 dark:text-gray-400 hover:text-rose-500">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Projects
                            </Button>
                        </Link>

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${project.color}, ${project.color}dd)`
                                    }}
                                >
                                    <Database className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                                        {project.name}
                                    </h1>
                                    {project.description && (
                                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Link href={`/dashboard/projects/${project.slug}/settings`}>
                                <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Endpoints</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {project.endpoints}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                        <Code className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Endpoints</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {project.activeEndpoints}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {project.requests}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">API Keys</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                            {project.apiKeys}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                        <Key className="w-6 h-6 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-1">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="endpoints" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                                Endpoints
                            </TabsTrigger>
                            <TabsTrigger value="api-keys" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                                API Keys
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white">Recent Endpoints</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {endpoints.slice(0, 5).map((endpoint) => (
                                            <div
                                                key={endpoint.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${methods.find(m => m.value === endpoint.method)?.color || 'bg-gray-500'}`}>
                                                        {endpoint.method}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {endpoint.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {endpoint.path}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link href={`/dashboard/builder?endpoint=${endpoint.id}`}>
                                                    <Button size="sm" variant="ghost">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                        {endpoints.length === 0 && (
                                            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                                                No endpoints yet
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            onClick={() => setIsCreateEndpointOpen(true)}
                                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create New Endpoint
                                        </Button>
                                        <Button
                                            onClick={() => setIsCreateApiKeyOpen(true)}
                                            className="w-full justify-start bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                                        >
                                            <Key className="w-4 h-4 mr-2" />
                                            Generate API Key
                                        </Button>
                                        <Link href={`/dashboard/builder?project=${project.id}`} className="block">
                                            <Button className="w-full justify-start bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
                                                <Code className="w-4 h-4 mr-2" />
                                                Open Visual Builder
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="endpoints" className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        placeholder="Search endpoints..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50"
                                    />
                                </div>
                                <Button
                                    onClick={() => setIsCreateEndpointOpen(true)}
                                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Endpoint
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {filteredEndpoints.map((endpoint) => (
                                    <Card key={endpoint.id} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${methods.find(m => m.value === endpoint.method)?.color || 'bg-gray-500'}`}>
                                                            {endpoint.method}
                                                        </span>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {endpoint.name}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${endpoint.isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
                                                            {endpoint.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-2">
                                                        {endpoint.path}
                                                    </p>
                                                    {endpoint.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                            {endpoint.description}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-6 text-sm">
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">Requests: </span>
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {endpoint.requests}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => toggleEndpointStatus(endpoint.id, endpoint.isActive)}
                                                        className={endpoint.isActive ? 'hover:bg-amber-500/10 hover:text-amber-500' : 'hover:bg-green-500/10 hover:text-green-500'}
                                                    >
                                                        {endpoint.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                    </Button>
                                                    <Link href={`/dashboard/builder?endpoint=${endpoint.id}`}>
                                                        <Button size="icon" variant="ghost" className="hover:bg-blue-500/10 hover:text-blue-500">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setDeleteEndpointId(endpoint.id)}
                                                        className="hover:bg-red-500/10 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredEndpoints.length === 0 && (
                                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                    <CardContent className="p-12 text-center">
                                        <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            No Endpoints Found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            {searchQuery ? 'Try adjusting your search query' : 'Create your first endpoint to get started'}
                                        </p>
                                        {!searchQuery && (
                                            <Button
                                                onClick={() => setIsCreateEndpointOpen(true)}
                                                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create First Endpoint
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                        <TabsContent value="api-keys" className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">API Keys</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Manage your API keys for authentication
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsCreateApiKeyOpen(true)}
                                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New API Key
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {apiKeys.map((apiKey) => (
                                    <Card key={apiKey.id} className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Key className="w-5 h-5 text-rose-500" />
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {apiKey.name}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${apiKey.isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
                                                            {apiKey.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mb-4">
                                                        <code className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                                                            {apiKey.key}
                                                        </code>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                                            className="hover:bg-rose-500/10 hover:text-rose-500"
                                                        >
                                                            {copiedKey === apiKey.id ? (
                                                                <Check className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                                                        <div>
                                                            <span>Created: </span>
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {new Date(apiKey.createdAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span>Last Used: </span>
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {apiKey.lastUsedAt
                                                                    ? new Date(apiKey.lastUsedAt).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })
                                                                    : 'Never'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={async () => {
                                                            try {
                                                                await fetch(`/api/dashboard/api-keys/${apiKey.id}/toggle`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ isActive: !apiKey.isActive })
                                                                });
                                                                fetchProjectData();
                                                            } catch (error) {
                                                                console.error('Error toggling API key:', error);
                                                            }
                                                        }}
                                                        className={apiKey.isActive ? 'hover:bg-amber-500/10 hover:text-amber-500' : 'hover:bg-green-500/10 hover:text-green-500'}
                                                    >
                                                        {apiKey.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to delete this API key?')) {
                                                                try {
                                                                    await fetch(`/api/dashboard/api-keys/${apiKey.id}`, {
                                                                        method: 'DELETE'
                                                                    });
                                                                    fetchProjectData();
                                                                } catch (error) {
                                                                    console.error('Error deleting API key:', error);
                                                                }
                                                            }
                                                        }}
                                                        className="hover:bg-red-500/10 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {apiKeys.length === 0 && (
                                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                                    <CardContent className="p-12 text-center">
                                        <Key className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            No API Keys Yet
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            Generate an API key to start making authenticated requests
                                        </p>
                                        <Button
                                            onClick={() => setIsCreateApiKeyOpen(true)}
                                            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Generate First API Key
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>

                <Dialog open={isCreateEndpointOpen} onOpenChange={setIsCreateEndpointOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                Create New Endpoint
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                                Define your API endpoint configuration
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateEndpoint} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Endpoint Name
                                </label>
                                <Input
                                    placeholder="Get User Data"
                                    value={endpointFormData.name}
                                    onChange={(e) => setEndpointFormData({ ...endpointFormData, name: e.target.value })}
                                    required
                                    className="border-gray-300 dark:border-gray-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Path
                                </label>
                                <Input
                                    placeholder="/api/users/:id"
                                    value={endpointFormData.path}
                                    onChange={(e) => setEndpointFormData({ ...endpointFormData, path: e.target.value })}
                                    required
                                    className="border-gray-300 dark:border-gray-700 font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    HTTP Method
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {methods.map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => setEndpointFormData({ ...endpointFormData, method: method.value })}
                                            className={`py-2 rounded-lg text-sm font-bold transition-all ${endpointFormData.method === method.value
                                                ? `${method.color} text-white shadow-lg`
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {method.value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Description (Optional)
                                </label>
                                <Textarea
                                    placeholder="Brief description of what this endpoint does..."
                                    value={endpointFormData.description}
                                    onChange={(e) => setEndpointFormData({ ...endpointFormData, description: e.target.value })}
                                    rows={3}
                                    className="border-gray-300 dark:border-gray-700"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateEndpointOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                >
                                    Create Endpoint
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isCreateApiKeyOpen} onOpenChange={setIsCreateApiKeyOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                Generate API Key
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                                Create a new API key for this project
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateApiKey} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Key Name
                                </label>
                                <Input
                                    placeholder="Production API Key"
                                    value={apiKeyFormData.name}
                                    onChange={(e) => setApiKeyFormData({ ...apiKeyFormData, name: e.target.value })}
                                    required
                                    className="border-gray-300 dark:border-gray-700"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Choose a descriptive name to identify this key
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="flex gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                            Keep your API key secure
                                        </p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                                            Make sure to copy and store your API key in a safe place. You won`t be able to see it again.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateApiKeyOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                >
                                    Generate Key
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteEndpointId} onOpenChange={() => setDeleteEndpointId(null)}>
                    <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-white">
                                Delete Endpoint
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete this endpoint? This action cannot be undone and will remove all associated data and analytics.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteEndpointId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    if (deleteEndpointId) {
                                        try {
                                            await fetch(`/api/dashboard/endpoints/${deleteEndpointId}`, {
                                                method: 'DELETE'
                                            });
                                            setDeleteEndpointId(null);
                                            fetchProjectData();
                                        } catch (error) {
                                            console.error('Error deleting endpoint:', error);
                                        }
                                    }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}