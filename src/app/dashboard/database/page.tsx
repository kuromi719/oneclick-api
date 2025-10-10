/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table as TableIcon,
    Plus,
    Trash2,
    Edit,
    Database,
    Search,
    Columns,
    GripVertical,
    MoreVertical,
    FileText,
    Hash,
    Calendar,
    ToggleLeft,
    Code,
    Eye,
    Copy,
    Save,
    Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Column {
    id: string;
    name: string;
    type: "string" | "number" | "boolean" | "date" | "json";
    required: boolean;
    unique: boolean;
    default?: string;
}

interface TableSchema {
    id: string;
    name: string;
    displayName: string;
    projectId: string;
    columns: Column[];
    createdAt: string;
    updatedAt: string;
}

interface Project {
    id: string;
    name: string;
    slug: string;
}

interface TableData {
    id: string;
    data: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

const columnTypeIcons = {
    string: FileText,
    number: Hash,
    boolean: ToggleLeft,
    date: Calendar,
    json: Code,
};

const columnTypes = [
    { value: "string", label: "Text", icon: FileText, color: "from-blue-500 to-cyan-600" },
    { value: "number", label: "Number", icon: Hash, color: "from-green-500 to-emerald-600" },
    { value: "boolean", label: "Boolean", icon: ToggleLeft, color: "from-amber-500 to-orange-600" },
    { value: "date", label: "Date", icon: Calendar, color: "from-purple-500 to-violet-600" },
    { value: "json", label: "JSON", icon: Code, color: "from-pink-500 to-rose-600" },
];

function SortableColumn({
    column,
    onEdit,
    onDelete,
    isSystem,
}: {
    column: Column;
    onEdit: () => void;
    onDelete: () => void;
    isSystem: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        disabled: isSystem,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const TypeIcon = columnTypeIcons[column.type];
    const typeConfig = columnTypes.find((t) => t.value === column.type);

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group relative p-4 rounded-lg border transition-all ${isDragging
                ? "border-rose-500 bg-rose-500/5 shadow-lg"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-rose-500/30"
                }`}
        >
            <div className="flex items-start gap-3">
                {!isSystem && (
                    <button
                        {...attributes}
                        {...listeners}
                        className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-rose-500 transition-colors"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>
                )}

                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeConfig?.color} flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {column.name}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-500/10 text-gray-600 dark:text-gray-400 font-mono">
                            {column.type}
                        </span>
                        {isSystem && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                System
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {column.required && (
                            <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                                Required
                            </span>
                        )}
                        {column.unique && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                Unique
                            </span>
                        )}
                        {column.default && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-500/10 text-gray-600 dark:text-gray-400">
                                Default: {column.default}
                            </span>
                        )}
                    </div>
                </div>

                {!isSystem && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Column
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Column
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </motion.div>
    );
}

export default function DatabasePage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [tables, setTables] = useState<TableSchema[]>([]);
    const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"schema" | "data">("schema");

    const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);
    const [isViewDataOpen, setIsViewDataOpen] = useState(false);
    const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
    const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
    const [editingColumn, setEditingColumn] = useState<Column | null>(null);

    const [newTable, setNewTable] = useState({
        name: "",
        displayName: "",
    });

    const [columnForm, setColumnForm] = useState<Partial<Column>>({
        name: "",
        type: "string",
        required: false,
        unique: false,
        default: "",
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const fetchTables = useCallback(async (projectId: string) => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/dashboard/database/tables?projectId=${projectId}`
            );
            if (response.ok) {
                const data = await response.json();
                setTables(data.tables || []);
            }
        } catch {
            toast.error("Failed to load tables");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTableData = useCallback(async (tableId: string) => {
        try {
            const response = await fetch(
                `/api/dashboard/database/tables/${tableId}/data`
            );
            if (response.ok) {
                const data = await response.json();
                setTableData(data.data || []);
            }
        } catch {
            toast.error("Failed to load table data");
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        if (selectedProject) {
            fetchTables(selectedProject);
            setSelectedTable(null);
        }
    }, [selectedProject, fetchTables]);

    useEffect(() => {
        if (selectedTable && viewMode === "data") {
            fetchTableData(selectedTable.id);
        }
    }, [selectedTable, viewMode, fetchTableData]);

    const handleCreateTable = async () => {
        if (!newTable.name || !newTable.displayName) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch("/api/dashboard/database/tables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newTable,
                    projectId: selectedProject,
                }),
            });

            if (response.ok) {
                toast.success("Table created successfully");
                setIsCreateTableOpen(false);
                setNewTable({ name: "", displayName: "" });
                fetchTables(selectedProject);
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to create table");
            }
        } catch {
            toast.error("Error creating table");
        }
    };

    const handleAddColumn = async () => {
        if (!selectedTable || !columnForm.name) {
            toast.error("Please fill in column name");
            return;
        }

        try {
            const response = await fetch(
                `/api/dashboard/database/tables/${selectedTable.id}/columns`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(columnForm),
                }
            );

            if (response.ok) {
                toast.success("Column added successfully");
                setIsAddColumnOpen(false);
                setColumnForm({
                    name: "",
                    type: "string",
                    required: false,
                    unique: false,
                    default: "",
                });
                fetchTables(selectedProject);
                if (selectedTable) {
                    const updatedTables = tables.map((t) =>
                        t.id === selectedTable.id
                            ? { ...t, columns: [...t.columns, columnForm as Column] }
                            : t
                    );
                    const updated = updatedTables.find((t) => t.id === selectedTable.id);
                    if (updated) setSelectedTable(updated);
                }
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to add column");
            }
        } catch {
            toast.error("Error adding column");
        }
    };

    const handleUpdateColumn = async () => {
        if (!selectedTable || !editingColumn) return;

        try {
            const response = await fetch(
                `/api/dashboard/database/tables/${selectedTable.id}/columns/${editingColumn.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(columnForm),
                }
            );

            if (response.ok) {
                toast.success("Column updated successfully");
                setIsEditColumnOpen(false);
                setEditingColumn(null);
                fetchTables(selectedProject);
            } else {
                toast.error("Failed to update column");
            }
        } catch {
            toast.error("Error updating column");
        }
    };

    const handleDeleteTable = async () => {
        if (!deleteTableId) return;

        try {
            const response = await fetch(
                `/api/dashboard/database/tables/${deleteTableId}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                toast.success("Table deleted successfully");
                setDeleteTableId(null);
                setSelectedTable(null);
                fetchTables(selectedProject);
            } else {
                toast.error("Failed to delete table");
            }
        } catch {
            toast.error("Error deleting table");
        }
    };

    const handleDeleteColumn = async () => {
        if (!selectedTable || !deleteColumnId) return;

        try {
            const response = await fetch(
                `/api/dashboard/database/tables/${selectedTable.id}/columns/${deleteColumnId}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                toast.success("Column deleted successfully");
                setDeleteColumnId(null);
                fetchTables(selectedProject);
            } else {
                toast.error("Failed to delete column");
            }
        } catch {
            toast.error("Error deleting column");
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || !selectedTable || active.id === over.id) return;

        const oldIndex = selectedTable.columns.findIndex((col) => col.id === active.id);
        const newIndex = selectedTable.columns.findIndex((col) => col.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newColumns = arrayMove(selectedTable.columns, oldIndex, newIndex);

        setSelectedTable({ ...selectedTable, columns: newColumns });

        try {
            const response = await fetch(
                `/api/dashboard/database/tables/${selectedTable.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        schema: { columns: newColumns },
                    }),
                }
            );

            if (response.ok) {
                toast.success("Column order saved");
                fetchTables(selectedProject);
            } else {
                toast.error("Failed to save column order");
                fetchTables(selectedProject);
            }
        } catch {
            toast.error("Error saving column order");
            fetchTables(selectedProject);
        }
    };

    const filteredTables = tables.filter(
        (table) =>
            table.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            table.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [isEditDataOpen, setIsEditDataOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<TableData | null>(null);
    const [deleteRowId, setDeleteRowId] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
                                >
                                    <Database className="w-6 h-6 text-white" />
                                </motion.div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                                    Database Builder
                                </h1>
                            </div>
                            <p className="text-base text-gray-600 dark:text-gray-400 ml-14">
                                Design and manage your custom database tables
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Select Project</Label>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-700">
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

                        <div className="relative">
                            <Label className="text-gray-700 dark:text-gray-300">Search Tables</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search tables..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 border-gray-300 dark:border-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {!selectedProject ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="border-gray-200 dark:border-gray-800">
                            <CardContent className="p-12 text-center">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Database className="w-20 h-20 mx-auto mb-6 text-purple-500" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Select a Project
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Choose a project to start building your database schema
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4">
                            <Card className="border-gray-200 dark:border-gray-800 sticky top-6">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <TableIcon className="w-5 h-5 text-purple-500" />
                                            Tables ({filteredTables.length})
                                        </CardTitle>
                                        <Button
                                            size="sm"
                                            onClick={() => setIsCreateTableOpen(true)}
                                            className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            New
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                    <div className="space-y-2">
                                        <AnimatePresence mode="popLayout">
                                            {filteredTables.map((table, index) => (
                                                <motion.button
                                                    key={table.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setSelectedTable(table);
                                                        setViewMode("schema");
                                                    }}
                                                    className={`w-full p-4 rounded-lg border text-left transition-all ${selectedTable?.id === table.id
                                                        ? "border-purple-500 bg-gradient-to-br from-purple-500/10 to-violet-500/10 shadow-md"
                                                        : "border-gray-200 dark:border-gray-800 hover:border-purple-500/50 hover:shadow-sm"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                                                <TableIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {table.displayName}
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                                    {table.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Columns className="w-3 h-3" />
                                                            {table.columns.length} columns
                                                        </span>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </AnimatePresence>

                                        {filteredTables.length === 0 && (
                                            <div className="text-center py-12">
                                                <TableIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                                    {searchQuery ? "No tables found" : "No tables yet"}
                                                </p>
                                                {!searchQuery && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setIsCreateTableOpen(true)}
                                                        className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Create First Table
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-8">
                            {selectedTable ? (
                                <div className="space-y-4">
                                    <Card className="border-gray-200 dark:border-gray-800">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                                                        <TableIcon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-2xl">{selectedTable.displayName}</CardTitle>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-1">
                                                            {selectedTable.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={viewMode === "schema" ? "default" : "outline"}
                                                        onClick={() => setViewMode("schema")}
                                                        className={
                                                            viewMode === "schema"
                                                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                                                                : ""
                                                        }
                                                    >
                                                        <Columns className="w-4 h-4 mr-2" />
                                                        Schema
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={viewMode === "data" ? "default" : "outline"}
                                                        onClick={() => setViewMode("data")}
                                                        className={
                                                            viewMode === "data"
                                                                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                                                                : ""
                                                        }
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Data
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDeleteTableId(selectedTable.id)}
                                                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>

                                    {viewMode === "schema" ? (
                                        <Card className="border-gray-200 dark:border-gray-800">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <Sparkles className="w-5 h-5 text-purple-500" />
                                                        Columns
                                                    </CardTitle>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setColumnForm({
                                                                name: "",
                                                                type: "string",
                                                                required: false,
                                                                unique: false,
                                                                default: "",
                                                            });
                                                            setIsAddColumnOpen(true);
                                                        }}
                                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add Column
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {selectedTable.columns.length > 0 ? (
                                                    <DndContext
                                                        sensors={sensors}
                                                        collisionDetection={closestCenter}
                                                        onDragEnd={handleDragEnd}
                                                    >
                                                        <SortableContext
                                                            items={selectedTable.columns.map((col) => col.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            <div className="space-y-3">
                                                                {selectedTable.columns.map((column) => {
                                                                    const isSystem =
                                                                        column.name === "id" || column.name === "created_at";
                                                                    return (
                                                                        <SortableColumn
                                                                            key={column.id}
                                                                            column={column}
                                                                            isSystem={isSystem}
                                                                            onEdit={() => {
                                                                                setEditingColumn(column);
                                                                                setColumnForm(column);
                                                                                setIsEditColumnOpen(true);
                                                                            }}
                                                                            onDelete={() => setDeleteColumnId(column.id)}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        </SortableContext>
                                                    </DndContext>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <Columns className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                            No Columns Yet
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                            Add your first column to get started
                                                        </p>
                                                        <Button
                                                            onClick={() => {
                                                                setColumnForm({
                                                                    name: "",
                                                                    type: "string",
                                                                    required: false,
                                                                    unique: false,
                                                                    default: "",
                                                                });
                                                                setIsAddColumnOpen(true);
                                                            }}
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Add First Column
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Card className="border-gray-200 dark:border-gray-800">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <Eye className="w-5 h-5 text-purple-500" />
                                                        Table Data ({tableData.length} rows)
                                                    </CardTitle>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setIsViewDataOpen(true)}
                                                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add Row
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {tableData.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                                                    {selectedTable.columns.map((col) => (
                                                                        <th
                                                                            key={col.id}
                                                                            className="text-left p-3 text-sm font-semibold text-gray-900 dark:text-white"
                                                                        >
                                                                            {col.name}
                                                                        </th>
                                                                    ))}
                                                                    <th className="text-right p-3 text-sm font-semibold text-gray-900 dark:text-white">
                                                                        Actions
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {tableData.map((row, idx) => (
                                                                    <motion.tr
                                                                        key={row.id}
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: idx * 0.05 }}
                                                                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                                                    >
                                                                        {selectedTable.columns.map((col) => (
                                                                            <td
                                                                                key={col.id}
                                                                                className="p-3 text-sm text-gray-600 dark:text-gray-400"
                                                                            >
                                                                                {typeof row.data[col.name] === "object"
                                                                                    ? JSON.stringify(row.data[col.name])
                                                                                    : String(row.data[col.name] ?? "-")}
                                                                            </td>
                                                                        ))}
                                                                        <td className="p-3 text-right">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => {
                                                                                        setEditingRow(row);
                                                                                        setColumnForm(row.data);
                                                                                        setIsEditDataOpen(true);
                                                                                    }}
                                                                                    className="hover:text-blue-500"
                                                                                >
                                                                                    <Edit className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => setDeleteRowId(row.id)}
                                                                                    className="hover:text-red-500"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </motion.tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                            No Data Yet
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                            Add your first row to populate this table
                                                        </p>
                                                        <Button
                                                            onClick={() => setIsViewDataOpen(true)}
                                                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Add First Row
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Card className="border-gray-200 dark:border-gray-800">
                                        <CardContent className="p-12 text-center">
                                            <motion.div
                                                animate={{
                                                    rotate: [0, 10, -10, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                <TableIcon className="w-20 h-20 mx-auto mb-6 text-purple-500" />
                                            </motion.div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                Select a Table
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Choose a table from the list to view and edit its schema
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                <Dialog open={isCreateTableOpen} onOpenChange={setIsCreateTableOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                Create New Table
                            </DialogTitle>
                            <DialogDescription>
                                Add a new table to your database schema
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Table Name (Technical)</Label>
                                <Input
                                    placeholder="users"
                                    value={newTable.name}
                                    onChange={(e) =>
                                        setNewTable({
                                            ...newTable,
                                            name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                        })
                                    }
                                    className="mt-1 font-mono border-gray-300 dark:border-gray-700"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Will be used as the database table name
                                </p>
                            </div>

                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Display Name</Label>
                                <Input
                                    placeholder="Users"
                                    value={newTable.displayName}
                                    onChange={(e) =>
                                        setNewTable({ ...newTable, displayName: e.target.value })
                                    }
                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Human-readable name for the UI
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateTableOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateTable}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Create Table
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-green-500" />
                                Add Column
                            </DialogTitle>
                            <DialogDescription>
                                Add a new column to {selectedTable?.displayName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Column Name</Label>
                                <Input
                                    placeholder="email"
                                    value={columnForm.name}
                                    onChange={(e) =>
                                        setColumnForm({
                                            ...columnForm,
                                            name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                        })
                                    }
                                    className="mt-1 font-mono border-gray-300 dark:border-gray-700"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Data Type</Label>
                                <Select
                                    value={columnForm.type}
                                    onValueChange={(value: any) =>
                                        setColumnForm({ ...columnForm, type: value })
                                    }
                                >
                                    <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columnTypes.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br ${type.color}`}
                                                        >
                                                            <Icon className="w-3 h-3 text-white" />
                                                        </div>
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Default Value (Optional)</Label>
                                <Input
                                    placeholder="Enter default value"
                                    value={columnForm.default}
                                    onChange={(e) =>
                                        setColumnForm({ ...columnForm, default: e.target.value })
                                    }
                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <div>
                                        <Label className="font-semibold text-gray-900 dark:text-white">
                                            Required
                                        </Label>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Field must have a value
                                        </p>
                                    </div>
                                    <Switch
                                        checked={columnForm.required}
                                        onCheckedChange={(checked) =>
                                            setColumnForm({ ...columnForm, required: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <div>
                                        <Label className="font-semibold text-gray-900 dark:text-white">
                                            Unique
                                        </Label>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Value must be unique
                                        </p>
                                    </div>
                                    <Switch
                                        checked={columnForm.unique}
                                        onCheckedChange={(checked) =>
                                            setColumnForm({ ...columnForm, unique: checked })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddColumnOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddColumn}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Column
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditColumnOpen} onOpenChange={setIsEditColumnOpen}>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Edit className="w-5 h-5 text-blue-500" />
                                Edit Column
                            </DialogTitle>
                            <DialogDescription>
                                Update column properties for {editingColumn?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Data Type</Label>
                                <Select
                                    value={columnForm.type}
                                    onValueChange={(value: any) =>
                                        setColumnForm({ ...columnForm, type: value })
                                    }
                                >
                                    <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columnTypes.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br ${type.color}`}
                                                        >
                                                            <Icon className="w-3 h-3 text-white" />
                                                        </div>
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Default Value</Label>
                                <Input
                                    placeholder="Enter default value"
                                    value={columnForm.default}
                                    onChange={(e) =>
                                        setColumnForm({ ...columnForm, default: e.target.value })
                                    }
                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <div>
                                        <Label className="font-semibold text-gray-900 dark:text-white">
                                            Required
                                        </Label>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Field must have a value
                                        </p>
                                    </div>
                                    <Switch
                                        checked={columnForm.required}
                                        onCheckedChange={(checked) =>
                                            setColumnForm({ ...columnForm, required: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <div>
                                        <Label className="font-semibold text-gray-900 dark:text-white">
                                            Unique
                                        </Label>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Value must be unique
                                        </p>
                                    </div>
                                    <Switch
                                        checked={columnForm.unique}
                                        onCheckedChange={(checked) =>
                                            setColumnForm({ ...columnForm, unique: checked })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditColumnOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateColumn}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDataOpen} onOpenChange={setIsEditDataOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Edit className="w-5 h-5 text-blue-500" />
                                Edit Row
                            </DialogTitle>
                            <DialogDescription>
                                Update data in {selectedTable?.displayName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            {selectedTable?.columns
                                .filter((col) => col.name !== "id" && col.name !== "created_at")
                                .map((column) => {
                                    const TypeIcon = columnTypeIcons[column.type];
                                    const typeConfig = columnTypes.find((t) => t.value === column.type);

                                    return (
                                        <div key={column.id}>
                                            <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <div
                                                    className={`w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br ${typeConfig?.color}`}
                                                >
                                                    <TypeIcon className="w-3 h-3 text-white" />
                                                </div>
                                                {column.name}
                                                {column.required && (
                                                    <span className="text-red-500 text-sm">*</span>
                                                )}
                                            </Label>

                                            {column.type === "boolean" ? (
                                                <div className="mt-2">
                                                    <Switch
                                                        checked={
                                                            (columnForm as any)[column.name] === true ||
                                                            (columnForm as any)[column.name] === "true"
                                                        }
                                                        onCheckedChange={(checked) =>
                                                            setColumnForm({ ...columnForm, [column.name]: checked })
                                                        }
                                                    />
                                                </div>
                                            ) : column.type === "json" ? (
                                                <Textarea
                                                    placeholder='{"key": "value"}'
                                                    value={
                                                        typeof (columnForm as any)[column.name] === "object"
                                                            ? JSON.stringify((columnForm as any)[column.name], null, 2)
                                                            : (columnForm as any)[column.name] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setColumnForm({ ...columnForm, [column.name]: e.target.value })
                                                    }
                                                    className="mt-1 font-mono border-gray-300 dark:border-gray-700"
                                                    rows={4}
                                                />
                                            ) : column.type === "date" ? (
                                                <Input
                                                    type="datetime-local"
                                                    value={(columnForm as any)[column.name] || ""}
                                                    onChange={(e) =>
                                                        setColumnForm({ ...columnForm, [column.name]: e.target.value })
                                                    }
                                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                                />
                                            ) : column.type === "number" ? (
                                                <Input
                                                    type="number"
                                                    placeholder={`Enter ${column.name}`}
                                                    value={(columnForm as any)[column.name] || ""}
                                                    onChange={(e) =>
                                                        setColumnForm({
                                                            ...columnForm,
                                                            [column.name]: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                                />
                                            ) : (
                                                <Input
                                                    type="text"
                                                    placeholder={`Enter ${column.name}`}
                                                    value={(columnForm as any)[column.name] || ""}
                                                    onChange={(e) =>
                                                        setColumnForm({
                                                            ...columnForm,
                                                            [column.name]: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                                />
                                            )}
                                        </div>
                                    );
                                })}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDataOpen(false);
                                        setEditingRow(null);
                                        setColumnForm({
                                            name: "",
                                            type: "string",
                                            required: false,
                                            unique: false,
                                            default: "",
                                        });
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (!selectedTable || !editingRow) return;

                                        try {
                                            const rowData: Record<string, unknown> = {};

                                            selectedTable.columns.forEach((col) => {
                                                if (col.name !== "id" && col.name !== "created_at") {
                                                    const value = (columnForm as any)[col.name];
                                                    if (value !== undefined && value !== "") {
                                                        if (col.type === "number") {
                                                            rowData[col.name] = parseFloat(value);
                                                        } else if (col.type === "boolean") {
                                                            rowData[col.name] = value === true || value === "true";
                                                        } else if (col.type === "json") {
                                                            try {
                                                                rowData[col.name] = JSON.parse(value);
                                                            } catch {
                                                                toast.error(`Invalid JSON in ${col.name}`);
                                                                return;
                                                            }
                                                        } else {
                                                            rowData[col.name] = value;
                                                        }
                                                    }
                                                }
                                            });

                                            const response = await fetch(
                                                `/api/dashboard/database/tables/${selectedTable.id}/data/${editingRow.id}`,
                                                {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(rowData),
                                                }
                                            );

                                            if (response.ok) {
                                                toast.success("Row updated successfully");
                                                setIsEditDataOpen(false);
                                                setEditingRow(null);
                                                setColumnForm({
                                                    name: "",
                                                    type: "string",
                                                    required: false,
                                                    unique: false,
                                                    default: "",
                                                });
                                                fetchTableData(selectedTable.id);
                                            } else {
                                                const error = await response.json();
                                                toast.error(error.error || "Failed to update row");
                                            }
                                        } catch {
                                            toast.error("Error updating row");
                                        }
                                    }}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!deleteRowId} onOpenChange={() => setDeleteRowId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Row</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this row? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteRowId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    if (!selectedTable || !deleteRowId) return;

                                    try {
                                        const response = await fetch(
                                            `/api/dashboard/database/tables/${selectedTable.id}/data/${deleteRowId}`,
                                            { method: "DELETE" }
                                        );

                                        if (response.ok) {
                                            toast.success("Row deleted successfully");
                                            setDeleteRowId(null);
                                            fetchTableData(selectedTable.id);
                                        } else {
                                            toast.error("Failed to delete row");
                                        }
                                    } catch {
                                        toast.error("Error deleting row");
                                    }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete Row
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!deleteTableId} onOpenChange={() => setDeleteTableId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Table</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this table? This will permanently delete
                                the table and all its data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteTableId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteTable}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete Table
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!deleteColumnId} onOpenChange={() => setDeleteColumnId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Column</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this column? All data in this column
                                will be lost. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteColumnId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteColumn}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete Column
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Dialog open={isViewDataOpen} onOpenChange={setIsViewDataOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" />
                                Add New Row
                            </DialogTitle>
                            <DialogDescription>
                                Add a new data row to {selectedTable?.displayName}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            {selectedTable?.columns
                                .filter((col) => col.name !== "id" && col.name !== "created_at")
                                .map((column) => {
                                    const TypeIcon = columnTypeIcons[column.type];
                                    const typeConfig = columnTypes.find((t) => t.value === column.type);

                                    return (
                                        <div key={column.id}>
                                            <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <div
                                                    className={`w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br ${typeConfig?.color}`}
                                                >
                                                    <TypeIcon className="w-3 h-3 text-white" />
                                                </div>
                                                {column.name}
                                                {column.required && (
                                                    <span className="text-red-500 text-sm">*</span>
                                                )}
                                            </Label>

                                            {column.type === "boolean" ? (
                                                <div className="mt-2">
                                                    <Switch
                                                        checked={
                                                            (columnForm as any)[column.name] === true ||
                                                            (columnForm as any)[column.name] === "true"
                                                        }
                                                        onCheckedChange={(checked) =>
                                                            setColumnForm({ ...columnForm, [column.name]: checked })
                                                        }
                                                    />
                                                </div>
                                            ) : column.type === "json" ? (
                                                <Textarea
                                                    placeholder='{"key": "value"}'
                                                    value={(columnForm as any)[column.name] || ""}
                                                    onChange={(e) =>
                                                        setColumnForm({ ...columnForm, [column.name]: e.target.value })
                                                    }
                                                    className="mt-1 font-mono border-gray-300 dark:border-gray-700"
                                                    rows={4}
                                                />
                                            ) : column.type === "date" ? (
                                                <Input
                                                    type="datetime-local"
                                                    value={(columnForm as any)[column.name] || ""}
                                                    onChange={(e) =>
                                                        setColumnForm({ ...columnForm, [column.name]: e.target.value })
                                                    }
                                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                                />
                                            ) : column.type === "number" ? (
                                                <Input
                                                    type="number"
                                                    placeholder={`Enter ${column.name}`}
                                                    value={(columnForm as any)[column.name] || ""}
                                                    onChange={(e) =>
                                                        setColumnForm({
                                                            ...columnForm,
                                                            [column.name]: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                                />
                                            ) : (
                                                <Input
                                                    type="text"
                                                    placeholder={`Enter ${column.name}`}
                                                    value={(columnForm as any)[column.name] || ""}
                                                    onChange={(e) =>
                                                        setColumnForm({
                                                            ...columnForm,
                                                            [column.name]: e.target.value,
                                                        })
                                                    }
                                                    className="mt-1 border-gray-300 dark:border-gray-700"
                                                />
                                            )}

                                            {column.default && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    Default: {column.default}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsViewDataOpen(false);
                                        setColumnForm({
                                            name: "",
                                            type: "string",
                                            required: false,
                                            unique: false,
                                            default: "",
                                        });
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (!selectedTable) return;

                                        try {
                                            const rowData: Record<string, unknown> = {};

                                            selectedTable.columns.forEach((col) => {
                                                if (col.name !== "id" && col.name !== "created_at") {
                                                    const value = (columnForm as any)[col.name];
                                                    if (value !== undefined && value !== "") {
                                                        if (col.type === "number") {
                                                            rowData[col.name] = parseFloat(value);
                                                        } else if (col.type === "boolean") {
                                                            rowData[col.name] = value === true || value === "true";
                                                        } else if (col.type === "json") {
                                                            try {
                                                                rowData[col.name] = JSON.parse(value);
                                                            } catch {
                                                                toast.error(`Invalid JSON in ${col.name}`);
                                                                return;
                                                            }
                                                        } else {
                                                            rowData[col.name] = value;
                                                        }
                                                    }
                                                }
                                            });

                                            const response = await fetch(
                                                `/api/dashboard/database/tables/${selectedTable.id}/data`,
                                                {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(rowData),
                                                }
                                            );

                                            if (response.ok) {
                                                toast.success("Row added successfully");
                                                setIsViewDataOpen(false);
                                                setColumnForm({
                                                    name: "",
                                                    type: "string",
                                                    required: false,
                                                    unique: false,
                                                    default: "",
                                                });
                                                fetchTableData(selectedTable.id);
                                            } else {
                                                const error = await response.json();
                                                toast.error(error.error || "Failed to add row");
                                            }
                                        } catch {
                                            toast.error("Error adding row");
                                        }
                                    }}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Row
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}