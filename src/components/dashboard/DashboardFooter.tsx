"use client";

import { motion } from "framer-motion";
import { Heart, Globe, Github } from "lucide-react";
import Link from "next/link";

export default function DashboardFooter() {
    return (
        <footer className="relative mt-16 border-t border-rose-500/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-500/30"
                        >
                            <Globe className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                                OneClick API
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Build your APIs visually ⚡
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-rose-500/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-1">
                        © {new Date().getFullYear()}{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">OneClick</span>. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link
                            href="https://github.com/spexdw/OneClickAPI/"
                            target="_blank"
                            className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        >
                            <Github className="w-4 h-4" />
                        </Link>
                        <span className="flex items-center gap-1">
                            Made by <Heart className="w-3.5 h-3.5 text-rose-500" /> SpeXCore
                        </span>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
}
