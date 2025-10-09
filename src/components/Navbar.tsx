"use client";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <nav className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 shadow-md">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">OneClick API Builder</h1>
            <div className="flex items-center gap-4">
                <Button onClick={toggleDarkMode} variant="outline">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </Button>
            </div>
        </nav>
    );
}
