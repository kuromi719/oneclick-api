"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    Save,
    Trash2,
    AlertCircle,
    Database,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

const colorOptions = [
    { name: "Rose", value: "#f43f5e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Green", value: "#10b981" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Cyan", value: "#06b6d4" },
];

export default function ProjectSettingsPage({ params }: PageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#f43f5e",
    });

    useEffect(() => {
        fetchProject();
    }, [slug]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/dashboard/projects/s/${slug}/settings`);
            if (response.ok) {
                const data = await response.json();
                setProject(data.project);
                setFormData({
                    name: data.project.name,
                    description: data.project.description || "",
                    color: data.project.color,
                });
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await fetch(`/api/dashboard/projects/s/${slug}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.project.slug !== slug) {
                    router.push(`/dashboard/projects/${data.project.slug}/settings`);
                } else {
                    fetchProject();
                }
            }
        } catch (error) {
            console.error('Error updating project:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/dashboard/projects/s/${slug}/settings`, {
                method: 'DELETE'
            });

            if (response.ok) {
                router.push('/dashboard/projects');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <Link href={`/dashboard/projects/${slug}`}>
                            <Button variant="ghost" className="mb-4 text-gray-600 dark:text-gray-400 hover:text-rose-500">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Project
                            </Button>
                        </Link>

                        <div className="flex items-center gap-4 mb-2">
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
                                    Project Settings
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Manage your project configuration
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">General Information</CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400">
                                    Update your project`s basic information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Project Name
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="My Awesome API"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50"
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        This will also update the project URL slug
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what this project does..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Project Color
                                    </Label>
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: color.value })}
                                                className={`relative w-12 h-12 rounded-xl transition-all hover:scale-110 ${formData.color === color.value
                                                    ? 'ring-4 ring-offset-2 ring-rose-500 dark:ring-offset-gray-900'
                                                    : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 dark:hover:ring-offset-gray-900'
                                                    }`}
                                                style={{
                                                    background: `linear-gradient(135deg, ${color.value}, ${color.value}dd)`
                                                }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white">Project URL</CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400">
                                    Your project`s unique identifier
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <code className="text-sm font-mono text-gray-900 dark:text-white">
                                        {window.location.origin}/p/{project.slug}
                                    </code>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>

                    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 mt-8">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                            <CardDescription className="text-red-600/80 dark:text-red-400/80">
                                Irreversible and destructive actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-red-200 dark:border-red-800">
                                <div>
                                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                        Delete Project
                                    </h4>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Permanently delete this project and all of its data
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="border-red-300 dark:border-red-700 text-red-600 hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Project
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-white">
                                Delete Project
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                Are you absolutely sure? This action cannot be undone. This will permanently delete the project
                                <span className="font-bold text-red-600"> `{project.name}`</span>, including all endpoints, API keys, and analytics data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete Project
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}