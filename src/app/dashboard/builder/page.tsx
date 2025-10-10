"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Globe,
    Database,
    Zap,
    GitBranch,
    Filter,
    Shield,
    Send,
    Save,
    Play,
    Trash2,
    Plus,
    Settings,
    ArrowLeft,
    Sparkles,
    Clock,
    Variable,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ReactFlow,
    Background,
    Controls,
    Connection,
    Node,
    Edge,
    addEdge,
    useNodesState,
    useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface Project {
    id: string;
    name: string;
    slug: string;
}

interface EndpointSettings {
    name: string;
    path: string;
    method: string;
    description: string;
    projectId: string;
    responseType: string;
    statusCode: number;
    rateLimit: number;
    rateLimitWindow: number;
    isActive: boolean;
}

interface CustomTable {
    id: string;
    name: string;
    displayName: string;
}

interface NodeConfig {
    [key: string]: string | number | boolean | undefined;
}

interface NodeData extends Record<string, unknown> {
    label: string;
    type: string;
    config?: NodeConfig;
}

const nodeTypes = [
    {
        type: "entry",
        label: "Entry Point",
        icon: Play,
        color: "from-green-500 to-emerald-600",
        description: "Starting point of the flow",
        disabled: true,
    },
    {
        type: "http-request",
        label: "HTTP Request",
        icon: Globe,
        color: "from-blue-500 to-cyan-600",
        description: "Make external API calls",
    },
    {
        type: "database-query",
        label: "Database Query",
        icon: Database,
        color: "from-purple-500 to-violet-600",
        description: "Query custom tables",
    },
    {
        type: "transform",
        label: "Transform Data",
        icon: Zap,
        color: "from-amber-500 to-orange-600",
        description: "Transform and manipulate data",
    },
    {
        type: "condition",
        label: "Condition",
        icon: GitBranch,
        color: "from-pink-500 to-rose-600",
        description: "Add conditional logic",
    },
    {
        type: "filter",
        label: "Filter",
        icon: Filter,
        color: "from-indigo-500 to-purple-600",
        description: "Filter data based on criteria",
    },
    {
        type: "auth-check",
        label: "Auth Check",
        icon: Shield,
        color: "from-red-500 to-rose-600",
        description: "Validate authentication",
    },
    {
        type: "delay",
        label: "Delay",
        icon: Clock,
        color: "from-gray-500 to-slate-600",
        description: "Add delay to execution",
    },
    {
        type: "variable",
        label: "Set Variable",
        icon: Variable,
        color: "from-yellow-500 to-amber-600",
        description: "Store data in variables",
    },
    {
        type: "response",
        label: "Response",
        icon: Send,
        color: "from-teal-500 to-cyan-600",
        description: "Send response to client",
    },
];

export default function BuilderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const endpointId = searchParams.get("endpoint");

    const [projects, setProjects] = useState<Project[]>([]);
    const [customTables, setCustomTables] = useState<CustomTable[]>([]);
    const [endpoint, setEndpoint] = useState<{
        projectId?: string;
        projectSlug?: string;
        flowData?: { nodes: Node<NodeData>[]; edges: Edge[] };
        name?: string;
        path?: string;
        method?: string;
        description?: string;
        responseType?: string;
        statusCode?: number;
        rateLimit?: number;
        rateLimitWindow?: number;
        isActive?: boolean;
    } | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
    const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
    const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);
    const [selectedProjectForSave, setSelectedProjectForSave] = useState("");
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const [endpointSettings, setEndpointSettings] = useState<EndpointSettings>({
        name: "",
        path: "",
        method: "GET",
        description: "",
        projectId: "",
        responseType: "json",
        statusCode: 200,
        rateLimit: 100,
        rateLimitWindow: 60,
        isActive: true,
    });

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await fetch("/api/dashboard/projects");
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
            }
        } catch {
            toast.error("Failed to load projects");
        }
    }, []);

    const initializeDefaultNodes = useCallback(() => {
        const entryNode: Node<NodeData> = {
            id: "entry-node",
            type: "entry",
            position: { x: 250, y: 50 },
            data: {
                label: "Entry Point",
                type: "entry",
                config: {},
            },
        };

        const responseNode: Node<NodeData> = {
            id: "response-node",
            type: "response",
            position: { x: 250, y: 400 },
            data: {
                label: "Response",
                type: "response",
                config: {
                    responseType: "json",
                    statusCode: 200,
                },
            },
        };

        setNodes([entryNode, responseNode]);
        setEdges([]);
    }, [setNodes, setEdges]);

    const fetchEndpoint = useCallback(async () => {
        if (!endpointId) return;

        try {
            const response = await fetch(
                `/api/dashboard/builder/endpoint/${endpointId}`
            );
            if (response.ok) {
                const data = await response.json();
                setEndpoint(data.endpoint);
                setEndpointSettings({
                    name: data.endpoint.name,
                    path: data.endpoint.path,
                    method: data.endpoint.method,
                    description: data.endpoint.description || "",
                    projectId: data.endpoint.projectId,
                    responseType: data.endpoint.responseType || "json",
                    statusCode: data.endpoint.statusCode || 200,
                    rateLimit: data.endpoint.rateLimit || 100,
                    rateLimitWindow: data.endpoint.rateLimitWindow || 60,
                    isActive: data.endpoint.isActive,
                });

                const flowData = data.endpoint.flowData;
                if (flowData && flowData.nodes && flowData.nodes.length > 0) {
                    setNodes(flowData.nodes);
                    setEdges(flowData.edges || []);
                } else {
                    initializeDefaultNodes();
                }
            }
        } catch {
            toast.error("Failed to load endpoint");
        }
    }, [endpointId, setNodes, setEdges, initializeDefaultNodes]);

    const fetchCustomTables = useCallback(async (projectId: string) => {
        try {
            const response = await fetch(
                `/api/dashboard/database/tables?projectId=${projectId}`
            );
            if (response.ok) {
                const data = await response.json();
                setCustomTables(data.tables || []);
            }
        } catch {
            console.error("Failed to fetch custom tables");
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (endpointId) {
            fetchEndpoint();
        } else {
            initializeDefaultNodes();
        }
    }, [endpointId, fetchEndpoint, initializeDefaultNodes]);

    useEffect(() => {
        if (endpoint?.projectId) {
            fetchCustomTables(endpoint.projectId);
        }
    }, [endpoint, fetchCustomTables]);

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge(params, eds));
        },
        [setEdges]
    );

    const handleAddNode = (type: string) => {
        if (type === "entry") {
            toast.error("Entry node cannot be added manually");
            return;
        }

        const nodeId = `${type}-${Date.now()}`;
        const newNode: Node<NodeData> = {
            id: nodeId,
            type: type,
            position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
            data: {
                label: nodeTypes.find((n) => n.type === type)?.label || type,
                type: type,
                config: {},
            },
        };

        setNodes((nds) => [...nds, newNode]);
        setSelectedNode(newNode);
        setIsNodeConfigOpen(true);
    };

    const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node as Node<NodeData>);
        setIsNodeConfigOpen(true);
    };

    const handleDeleteNode = () => {
        if (!selectedNode) return;

        if (selectedNode.id === "entry-node" || selectedNode.id === "response-node") {
            toast.error("Entry and Response nodes cannot be deleted");
            return;
        }

        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) =>
            eds.filter(
                (edge: Edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
            )
        );
        setSelectedNode(null);
        setIsNodeConfigOpen(false);
        toast.success("Node deleted");
    };

    const updateNodeConfig = (key: string, value: string | number | boolean) => {
        if (!selectedNode) return;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: {
                                ...(node.data.config as NodeConfig),
                                [key]: value,
                            },
                        },
                    };
                }
                return node;
            })
        );

        setSelectedNode({
            ...selectedNode,
            data: {
                ...selectedNode.data,
                config: {
                    ...(selectedNode.data.config as NodeConfig),
                    [key]: value,
                },
            },
        });
    };

    const handleSave = async () => {
        if (endpointId) {
            await saveExistingEndpoint();
        } else {
            if (!endpointSettings.projectId) {
                setIsProjectSelectOpen(true);
                return;
            }
            await createNewEndpoint();
        }
    };

    const saveExistingEndpoint = async () => {
        try {
            setSaving(true);
            const flowData = { nodes, edges };

            const response = await fetch(
                `/api/dashboard/builder/endpoint/${endpointId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...endpointSettings,
                        flowData,
                    }),
                }
            );

            if (response.ok) {
                toast.success("Flow saved successfully");
            } else {
                toast.error("Failed to save flow");
            }
        } catch {
            toast.error("Error saving flow");
        } finally {
            setSaving(false);
        }
    };

    const createNewEndpoint = async () => {
        try {
            setSaving(true);
            const flowData = { nodes, edges };

            const project = projects.find((p) => p.id === endpointSettings.projectId);
            if (!project) {
                toast.error("Project not found");
                return;
            }

            const response = await fetch(
                `/api/dashboard/projects/s/${project.slug}/endpoints`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...endpointSettings,
                        flowData,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                toast.success("Endpoint created successfully");
                router.push(`/dashboard/builder?endpoint=${data.endpoint.id}`);
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to create endpoint");
            }
        } catch {
            toast.error("Error creating endpoint");
        } finally {
            setSaving(false);
            setIsProjectSelectOpen(false);
        }
    };

    const handleTest = async () => {
        if (!endpointSettings.projectId || !endpointSettings.path) {
            toast.error("Please fill endpoint configuration and save first");
            return;
        }

        try {
            setTesting(true);
            toast.info("Testing endpoint...");

            let projectSlugToUse = endpoint?.projectSlug;

            if (!projectSlugToUse) {
                const selectedProject = projects.find(
                    (p) => p.id === endpointSettings.projectId
                );
                if (!selectedProject) {
                    toast.error("Project not found");
                    return;
                }
                projectSlugToUse = selectedProject.slug;
            }

            let cleanPath = endpointSettings.path;

            if (cleanPath.startsWith("/api/")) {
                cleanPath = cleanPath.replace("/api/", "/");
            }

            if (!cleanPath.startsWith("/")) {
                cleanPath = "/" + cleanPath;
            }

            const testUrl = `/api/${projectSlugToUse}${cleanPath}`;
            const method = endpointSettings.method;

            const testBody =
                method !== "GET" && method !== "HEAD"
                    ? { test: true, timestamp: new Date().toISOString() }
                    : undefined;

            const response = await fetch(testUrl, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: testBody ? JSON.stringify(testBody) : undefined,
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    <div>
                        <p className="font-bold">✅ Test Successful!</p>
                        <p className="text-xs mt-1">Status: {response.status}</p>
                        <p className="text-xs">URL: {testUrl}</p>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-32">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>,
                    { duration: 6000 }
                );
            } else {
                toast.error(
                    <div>
                        <p className="font-bold">❌ Test Failed</p>
                        <p className="text-xs mt-1">Status: {response.status}</p>
                        <p className="text-xs">URL: {testUrl}</p>
                        <p className="text-xs mt-1">Error: {data.error || "Unknown error"}</p>
                    </div>,
                    { duration: 6000 }
                );
            }
        } catch (error) {
            const err = error as Error;
            toast.error(
                <div>
                    <p className="font-bold">❌ Test Failed</p>
                    <p className="text-xs mt-1">Network error or endpoint not responding</p>
                    <p className="text-xs mt-1">{err.message}</p>
                </div>,
                { duration: 6000 }
            );
        } finally {
            setTesting(false);
        }
    };

    const getNodeStyle = (node: Node<NodeData>): string => {
        const isEntry = node.id === "entry-node";
        const isResponse = node.id === "response-node";

        if (isEntry || isResponse) {
            return `border-2 ${isEntry ? "border-green-500" : "border-teal-500"
                } shadow-lg`;
        }

        return selectedNode?.id === node.id
            ? "border-2 border-rose-500 shadow-xl"
            : "border border-gray-300 dark:border-gray-700";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <div className="h-screen flex flex-col">
                <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-xl">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (endpoint?.projectSlug) {
                                            router.push(`/dashboard/projects/${endpoint.projectSlug}`);
                                        } else {
                                            router.push("/dashboard/endpoints");
                                        }
                                    }}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg"
                                    >
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <div>
                                        <h1 className="text-xl font-black text-gray-900 dark:text-white">
                                            Visual Builder
                                        </h1>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {endpointSettings.name || "New Endpoint"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-rose-500">
                                        {nodes.length}
                                    </span>{" "}
                                    Nodes •{" "}
                                    <span className="font-semibold text-rose-500">
                                        {edges.length}
                                    </span>{" "}
                                    Connections
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTest}
                                    disabled={testing || !endpointId}
                                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {testing ? "Testing..." : "Test"}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex">
                    <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Endpoint Settings
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                            value={endpointSettings.name}
                                            onChange={(e) =>
                                                setEndpointSettings({
                                                    ...endpointSettings,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="My Endpoint"
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs">Path</Label>
                                        <Input
                                            value={endpointSettings.path}
                                            onChange={(e) =>
                                                setEndpointSettings({
                                                    ...endpointSettings,
                                                    path: e.target.value,
                                                })
                                            }
                                            placeholder="/users/:id"
                                            className="mt-1 h-8 text-sm font-mono"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs">Method</Label>
                                        <Select
                                            value={endpointSettings.method}
                                            onValueChange={(value) =>
                                                setEndpointSettings({ ...endpointSettings, method: value })
                                            }
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GET">GET</SelectItem>
                                                <SelectItem value="POST">POST</SelectItem>
                                                <SelectItem value="PUT">PUT</SelectItem>
                                                <SelectItem value="PATCH">PATCH</SelectItem>
                                                <SelectItem value="DELETE">DELETE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Status Code</Label>
                                        <Input
                                            type="number"
                                            value={endpointSettings.statusCode}
                                            onChange={(e) =>
                                                setEndpointSettings({
                                                    ...endpointSettings,
                                                    statusCode: parseInt(e.target.value),
                                                })
                                            }
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs">Rate Limit (requests)</Label>
                                        <Input
                                            type="number"
                                            value={endpointSettings.rateLimit}
                                            onChange={(e) =>
                                                setEndpointSettings({
                                                    ...endpointSettings,
                                                    rateLimit: parseInt(e.target.value),
                                                })
                                            }
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs">Rate Limit Window (seconds)</Label>
                                        <Input
                                            type="number"
                                            value={endpointSettings.rateLimitWindow}
                                            onChange={(e) =>
                                                setEndpointSettings({
                                                    ...endpointSettings,
                                                    rateLimitWindow: parseInt(e.target.value),
                                                })
                                            }
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                                        <Label className="text-xs">Active</Label>
                                        <Switch
                                            checked={endpointSettings.isActive}
                                            onCheckedChange={(checked) =>
                                                setEndpointSettings({ ...endpointSettings, isActive: checked })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Nodes
                                </h3>
                                <div className="space-y-2">
                                    {nodeTypes.map((nodeType) => {
                                        const Icon = nodeType.icon;
                                        return (
                                            <motion.button
                                                key={nodeType.type}
                                                whileHover={{ scale: nodeType.disabled ? 1 : 1.02 }}
                                                whileTap={{ scale: nodeType.disabled ? 1 : 0.98 }}
                                                onClick={() => !nodeType.disabled && handleAddNode(nodeType.type)}
                                                disabled={nodeType.disabled}
                                                className={`w-full p-3 rounded-lg text-left transition-all ${nodeType.disabled
                                                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                                                    : "hover:shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${nodeType.color} flex items-center justify-center flex-shrink-0`}
                                                    >
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {nodeType.label}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                            {nodeType.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <ReactFlow
                            nodes={nodes.map((node) => ({
                                ...node,
                                style: {
                                    ...node.style,
                                    background: node.id === "entry-node"
                                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                        : node.id === "response-node"
                                            ? "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)"
                                            : "white",
                                    color: node.id === "entry-node" || node.id === "response-node"
                                        ? getNodeStyle(node)
                                        : "black",
                                    border: getNodeStyle(node),
                                    borderRadius: "12px",
                                    padding: "12px",
                                    fontWeight: "600",
                                },
                            }))}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={handleNodeClick}
                            fitView
                        >
                            <Background />
                            <Controls />
                        </ReactFlow>
                    </div>
                </div>
            </div>

            <Dialog open={isNodeConfigOpen} onOpenChange={setIsNodeConfigOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-rose-500" />
                            Configure Node: {selectedNode?.data.label}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the settings for this node
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {selectedNode?.id === "entry-node" && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    This is the entry point of your API flow. All requests start here.
                                    Available data: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">body</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">query</code>, <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">headers</code>
                                </p>
                            </div>
                        )}

                        {selectedNode?.id === "response-node" && (
                            <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                    This node sends the final response to the client. Cannot be deleted.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <Label>Response Type</Label>
                                        <Select
                                            value={(selectedNode.data.config?.responseType as string) || "json"}
                                            onValueChange={(value) => updateNodeConfig("responseType", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="json">JSON</SelectItem>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="html">HTML</SelectItem>
                                                <SelectItem value="xml">XML</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Status Code</Label>
                                        <Input
                                            type="number"
                                            value={(selectedNode.data.config?.statusCode as number) || 200}
                                            onChange={(e) => updateNodeConfig("statusCode", parseInt(e.target.value))}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label>Body Template (Optional)</Label>
                                        <Textarea
                                            placeholder='{"message": "Success", "data": "{{context.data}}"}'
                                            value={(selectedNode.data.config?.bodyTemplate as string) || ""}
                                            onChange={(e) => updateNodeConfig("bodyTemplate", e.target.value)}
                                            className="mt-1 font-mono text-sm"
                                            rows={6}
                                        />
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Use {`{{key}}`} to reference context data
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedNode?.type === "http-request" && (
                            <>
                                <div>
                                    <Label>URL</Label>
                                    <Input
                                        placeholder="https://api.example.com/users"
                                        value={(selectedNode.data.config?.url as string) || ""}
                                        onChange={(e) => updateNodeConfig("url", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Method</Label>
                                    <Select
                                        value={(selectedNode.data.config?.method as string) || "GET"}
                                        onValueChange={(value) => updateNodeConfig("method", value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Headers (JSON)</Label>
                                    <Textarea
                                        placeholder='{"Authorization": "Bearer token"}'
                                        value={(selectedNode.data.config?.headers as string) || ""}
                                        onChange={(e) => updateNodeConfig("headers", e.target.value)}
                                        className="mt-1 font-mono text-sm"
                                        rows={4}
                                    />
                                </div>
                            </>
                        )}

                        {selectedNode?.type === "database-query" && (
                            <>
                                <div>
                                    <Label>Data Source</Label>
                                    <Select
                                        value={(selectedNode.data.config?.dataSource as string) || "custom"}
                                        onValueChange={(value) => {
                                            updateNodeConfig("dataSource", value);
                                        }}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Custom Tables</SelectItem>
                                            <SelectItem value="system">System Tables</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedNode.data.config?.dataSource === "custom" && (
                                    <>
                                        <div>
                                            <Label>Table</Label>
                                            <Select
                                                value={(selectedNode.data.config?.tableId as string) || ""}
                                                onValueChange={(value) => {
                                                    updateNodeConfig("tableId", value);
                                                }}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select table" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customTables.map((table) => (
                                                        <SelectItem key={table.id} value={table.id}>
                                                            {table.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {customTables.length === 0 && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                    No custom tables found. Create one in Database Builder.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Operation</Label>
                                            <Select
                                                value={(selectedNode.data.config?.operation as string) || "find"}
                                                onValueChange={(value) => {
                                                    updateNodeConfig("operation", value);
                                                }}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="find">Find (SELECT)</SelectItem>
                                                    <SelectItem value="findOne">Find One</SelectItem>
                                                    <SelectItem value="insert">Insert (CREATE)</SelectItem>
                                                    <SelectItem value="update">Update</SelectItem>
                                                    <SelectItem value="delete">Delete</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Filter (JSON)</Label>
                                            <Textarea
                                                placeholder='{"email": "{{input.email}}"}'
                                                value={(selectedNode.data.config?.filter as string) || ""}
                                                onChange={(e) => updateNodeConfig("filter", e.target.value)}
                                                className="mt-1 font-mono text-sm"
                                                rows={4}
                                            />
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Use {`{{key}}`} to reference context data
                                            </p>
                                        </div>
                                    </>
                                )}

                                {selectedNode.data.config?.dataSource === "system" && (
                                    <>
                                        <div>
                                            <Label>Query Type</Label>
                                            <Select
                                                value={(selectedNode.data.config?.queryType as string) || "select"}
                                                onValueChange={(value) => {
                                                    updateNodeConfig("queryType", value);
                                                }}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="select">SELECT</SelectItem>
                                                    <SelectItem value="insert">INSERT</SelectItem>
                                                    <SelectItem value="update">UPDATE</SelectItem>
                                                    <SelectItem value="delete">DELETE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Table Name</Label>
                                            <Input
                                                placeholder="projects"
                                                value={(selectedNode.data.config?.table as string) || ""}
                                                onChange={(e) => updateNodeConfig("table", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label>Custom Query (Optional)</Label>
                                            <Textarea
                                                placeholder="SELECT * FROM projects WHERE slug = ?"
                                                value={(selectedNode.data.config?.query as string) || ""}
                                                onChange={(e) => updateNodeConfig("query", e.target.value)}
                                                className="mt-1 font-mono text-sm"
                                                rows={4}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {selectedNode?.type === "transform" && (
                            <>
                                <div>
                                    <Label>Transform Type</Label>
                                    <Select
                                        value={(selectedNode.data.config?.transformType as string) || "map"}
                                        onValueChange={(value) => updateNodeConfig("transformType", value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="map">Map</SelectItem>
                                            <SelectItem value="reduce">Reduce</SelectItem>
                                            <SelectItem value="custom">Custom Function</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Transform Function</Label>
                                    <Textarea
                                        placeholder="(item) => ({ ...item, processed: true })"
                                        value={(selectedNode.data.config?.transformFn as string) || ""}
                                        onChange={(e) => updateNodeConfig("transformFn", e.target.value)}
                                        className="mt-1 font-mono text-sm"
                                        rows={6}
                                    />
                                </div>
                            </>
                        )}

                        {selectedNode?.type === "condition" && (
                            <>
                                <div>
                                    <Label>Condition Expression</Label>
                                    <Textarea
                                        placeholder="data.status === 'active'"
                                        value={(selectedNode.data.config?.condition as string) || ""}
                                        onChange={(e) => updateNodeConfig("condition", e.target.value)}
                                        className="mt-1 font-mono text-sm"
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        JavaScript expression that returns true/false
                                    </p>
                                </div>
                            </>
                        )}

                        {selectedNode?.type === "filter" && (
                            <>
                                <div>
                                    <Label>Filter Expression</Label>
                                    <Textarea
                                        placeholder="(item) => item.age > 18"
                                        value={(selectedNode.data.config?.filterExpr as string) || ""}
                                        onChange={(e) => updateNodeConfig("filterExpr", e.target.value)}
                                        className="mt-1 font-mono text-sm"
                                        rows={4}
                                    />
                                </div>
                            </>
                        )}

                        {selectedNode?.type === "auth-check" && (
                            <>
                                <div>
                                    <Label>Auth Type</Label>
                                    <Select
                                        value={(selectedNode.data.config?.authType as string) || "bearer"}
                                        onValueChange={(value) => updateNodeConfig("authType", value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bearer">Bearer Token</SelectItem>
                                            <SelectItem value="apikey">API Key</SelectItem>
                                            <SelectItem value="basic">Basic Auth</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Header Name</Label>
                                    <Input
                                        placeholder="Authorization"
                                        value={(selectedNode.data.config?.headerName as string) || "Authorization"}
                                        onChange={(e) => updateNodeConfig("headerName", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                    <div>
                                        <Label className="font-semibold">Required</Label>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Fail if auth is missing
                                        </p>
                                    </div>
                                    <Switch
                                        checked={(selectedNode.data.config?.required as boolean) !== false}
                                        onCheckedChange={(checked) => updateNodeConfig("required", checked)}
                                    />
                                </div>
                            </>
                        )}

                        {selectedNode?.type === "delay" && (
                            <>
                                <div>
                                    <Label>Delay Duration (milliseconds)</Label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={(selectedNode.data.config?.duration as number) || 1000}
                                        onChange={(e) => updateNodeConfig("duration", parseInt(e.target.value))}
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        1000ms = 1 second
                                    </p>
                                </div>
                            </>
                        )}

                        {selectedNode?.type === "variable" && (
                            <>
                                <div>
                                    <Label>Variable Name</Label>
                                    <Input
                                        placeholder="userId"
                                        value={(selectedNode.data.config?.variableName as string) || ""}
                                        onChange={(e) => updateNodeConfig("variableName", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Value Expression</Label>
                                    <Textarea
                                        placeholder="context.user.id"
                                        value={(selectedNode.data.config?.valueExpr as string) || ""}
                                        onChange={(e) => updateNodeConfig("valueExpr", e.target.value)}
                                        className="mt-1 font-mono text-sm"
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        JavaScript expression to compute the value
                                    </p>
                                </div>
                            </>
                        )}

                        {selectedNode?.type === "email" && (
                            <>
                                <div>
                                    <Label>To Email</Label>
                                    <Input
                                        placeholder="user@example.com or {{context.email}}"
                                        value={(selectedNode.data.config?.to as string) || ""}
                                        onChange={(e) => updateNodeConfig("to", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Subject</Label>
                                    <Input
                                        placeholder="Welcome to our platform"
                                        value={(selectedNode.data.config?.subject as string) || ""}
                                        onChange={(e) => updateNodeConfig("subject", e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Body</Label>
                                    <Textarea
                                        placeholder="Hello {{context.name}}, welcome!"
                                        value={(selectedNode.data.config?.body as string) || ""}
                                        onChange={(e) => updateNodeConfig("body", e.target.value)}
                                        className="mt-1"
                                        rows={6}
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Use {`{{key}}`} to reference context data
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                            {selectedNode?.id !== "entry-node" && selectedNode?.id !== "response-node" && (
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteNode}
                                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Node
                                </Button>
                            )}
                            <Button
                                onClick={() => setIsNodeConfigOpen(false)}
                                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isProjectSelectOpen} onOpenChange={setIsProjectSelectOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-rose-500" />
                            Select Project
                        </DialogTitle>
                        <DialogDescription>
                            Choose which project this endpoint belongs to
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <Label>Project</Label>
                            <Select
                                value={selectedProjectForSave}
                                onValueChange={setSelectedProjectForSave}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Choose a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            <div className="flex items-center gap-2">
                                                <Database className="w-4 h-4" />
                                                {project.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsProjectSelectOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setEndpointSettings({
                                        ...endpointSettings,
                                        projectId: selectedProjectForSave,
                                    });
                                    createNewEndpoint();
                                }}
                                disabled={!selectedProjectForSave}
                                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                            >
                                Save Endpoint
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}