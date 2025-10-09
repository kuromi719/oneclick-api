"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push("/dashboard/home");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center p-4">
            <motion.div
                className="absolute inset-0 opacity-40"
                animate={{
                    background: [
                        "radial-gradient(circle at 0% 0%, #fb7185 0%, transparent 50%)",
                        "radial-gradient(circle at 100% 100%, #f43f5e 0%, transparent 50%)",
                        "radial-gradient(circle at 0% 100%, #fda4af 0%, transparent 50%)",
                        "radial-gradient(circle at 100% 0%, #fb923c 0%, transparent 50%)",
                        "radial-gradient(circle at 50% 50%, #ec4899 0%, transparent 50%)",
                        "radial-gradient(circle at 0% 0%, #fb7185 0%, transparent 50%)",
                    ],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * 3 + 1,
                        height: Math.random() * 3 + 1,
                        backgroundColor: ['#fb7185', '#f43f5e', '#fda4af', '#ec4899'][Math.floor(Math.random() * 4)],
                    }}
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                    }}
                    animate={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: Math.random() * 8 + 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            <motion.div
                className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-2 border-rose-500/10 rounded-full"
                style={{
                    x: "-50%",
                    y: "-50%",
                }}
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    ease: [0.6, -0.05, 0.01, 0.99],
                }}
                className="relative z-10 w-full max-w-md"
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 mb-4"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Sparkles className="w-8 h-8 text-rose-500" />
                        <h1
                            className="text-4xl font-black"
                            style={{
                                background: "linear-gradient(135deg, #fda4af 0%, #fb7185 50%, #f43f5e 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            OneClick API
                        </h1>
                        <Sparkles className="w-8 h-8 text-rose-500" />
                    </motion.div>
                </motion.div>

                <Card className="border-2 border-rose-500/20 bg-black/40 backdrop-blur-xl shadow-2xl shadow-rose-500/10">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                            Welcome Admin
                        </CardTitle>
                        <CardDescription className="text-center text-gray-400">
                            Log in to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-300">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 bg-black/50 border-rose-500/30 focus:border-rose-500 text-white placeholder:text-gray-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-300">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-black/50 border-rose-500/30 focus:border-rose-500 text-white placeholder:text-gray-500"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-6 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all"
                            >
                                {loading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </form>

                        <motion.div
                            className="mt-6 h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent rounded-full"
                            animate={{
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </CardContent>
                </Card>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-gray-500 text-sm mt-6"
                >
                    OneClick API Builder © 2025
                </motion.p>
            </motion.div>

            <motion.div
                className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/20 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />
        </div>
    );
}