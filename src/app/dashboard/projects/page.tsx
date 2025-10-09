"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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
    Plus,
    Database,
    Code,
    Activity,
    Clock,
    Trash2,
    Edit,
    Search,
    Filter,
    ArrowRight,
    Sparkles,
    Folder,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#f43f5e",
    });
    const [submitting, setSubmitting] = useState(false);

    const colors = [
        { value: "#f43f5e", label: "Rose", class: "from-rose-500 to-pink-600" },
        { value: "#a855f7", label: "Purple", class: "from-purple-500 to-violet-600" },
        { value: "#3b82f6", label: "Blue", class: "from-blue-500 to-cyan-600" },
        { value: "#10b981", label: "Green", class: "from-green-500 to-emerald-600" },
        { value: "#f59e0b", label: "Amber", class: "from-amber-500 to-orange-600" },
        { value: "#ec4899", label: "Pink", class: "from-pink-500 to-rose-600" },
    ];

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const filtered = projects.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProjects(filtered);
    }, [searchQuery, projects]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
                setFilteredProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/dashboard/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsCreateModalOpen(false);
                setFormData({ name: "", description: "", color: "#f43f5e" });
                fetchProjects();
            }
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProject) return;

        setSubmitting(true);

        try {
            const response = await fetch(`/api/dashboard/projects/${editingProject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsEditModalOpen(false);
                setEditingProject(null);
                setFormData({ name: "", description: "", color: "#f43f5e" });
                fetchProjects();
            }
        } catch (error) {
            console.error('Error updating project:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!deleteProjectId) return;

        try {
            const response = await fetch(`/api/dashboard/projects/${deleteProjectId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setDeleteProjectId(null);
                fetchProjects();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || "",
            color: project.color
        });
        setIsEditModalOpen(true);
    };

    const getColorGradient = (colorValue: string) => {
        const color = colors.find(c => c.value === colorValue);
        return color?.class || colors[0].class;
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
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                                    <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                                    Projects
                                </h1>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-0 sm:ml-14">
                                Manage your API projects and endpoints
                            </p>
                        </div>

                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/30 w-full sm:w-auto"
                                    size="lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Create New Project
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                                        Start building your API by creating a new project
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateProject} className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Project Name
                                        </label>
                                        <Input
                                            placeholder="My Awesome API"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="border-gray-300 dark:border-gray-700 focus:border-rose-500 dark:focus:border-rose-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Description
                                        </label>
                                        <Textarea
                                            placeholder="A brief description of your project..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="border-gray-300 dark:border-gray-700 focus:border-rose-500 dark:focus:border-rose-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Project Color
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {colors.map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                                    className={`relative p-4 rounded-lg border-2 transition-all ${formData.color === color.value
                                                        ? 'border-rose-500 shadow-lg shadow-rose-500/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                >
                                                    <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${color.class}`} />
                                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center">
                                                        {color.label}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                        >
                                            {submitting ? 'Creating...' : 'Create Project'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50 focus:border-rose-500 dark:focus:border-rose-500"
                        />
                    </div>
                </motion.div>

                {filteredProjects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <CardContent className="p-12 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl flex items-center justify-center">
                                    <Folder className="w-10 h-10 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {searchQuery ? 'No projects found' : 'No Projects Yet'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                    {searchQuery
                                        ? 'Try adjusting your search query'
                                        : 'Create your first project to start building amazing APIs'
                                    }
                                </p>
                                {!searchQuery && (
                                    <Button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Your First Project
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Card className="group cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-xl transition-all duration-300 h-full">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getColorGradient(project.color)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                    <Database className="w-7 h-7 text-white" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditModal(project)}
                                                        className="hover:bg-blue-500/10 hover:text-blue-500"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteProjectId(project.id)}
                                                        className="hover:bg-red-500/10 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                                                    {project.name}
                                                </h3>
                                                {project.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Code className="w-4 h-4" />
                                                        Endpoints
                                                    </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {project.endpoints}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Activity className="w-4 h-4" />
                                                        Requests
                                                    </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {project.requests}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Clock className="w-4 h-4" />
                                                        Last Used
                                                    </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {project.lastUsed}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                                                <div className={`px-3 py-1.5 rounded-full flex-1 text-center ${project.status === 'active'
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
                                                <Link href={`/dashboard/projects/${project.slug}`}>
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                                    >
                                                        View
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
                    <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-white">
                                Delete Project
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete this project? This action cannot be undone and will delete all endpoints and data associated with this project.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteProjectId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteProject}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                Edit Project
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                                Update your project details
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditProject} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Project Name
                                </label>
                                <Input
                                    placeholder="My Awesome API"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="border-gray-300 dark:border-gray-700 focus:border-rose-500 dark:focus:border-rose-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="A brief description of your project..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="border-gray-300 dark:border-gray-700 focus:border-rose-500 dark:focus:border-rose-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Project Color
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {colors.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`relative p-4 rounded-lg border-2 transition-all ${formData.color === color.value
                                                ? 'border-rose-500 shadow-lg shadow-rose-500/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${color.class}`} />
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center">
                                                {color.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                                >
                                    {submitting ? 'Updating...' : 'Update Project'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
