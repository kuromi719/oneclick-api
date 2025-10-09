"use client";
/* https://i.imgur.com/3Gd77WY.png WOW! */
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
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

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, #f43f5e 0%, #ec4899 30%, transparent 70%)",
        }}
        animate={{
          x: mousePosition.x - 250,
          y: mousePosition.y - 250,
        }}
        transition={{
          type: "spring",
          damping: 40,
          stiffness: 150,
        }}
      />

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
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
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute top-1/2 left-1/2 w-[700px] h-[700px] border-2 border-rose-500/10 rounded-full"
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
        className="absolute top-1/2 left-1/2 w-[850px] h-[850px] border-2 border-pink-500/10 rounded-full"
        style={{
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <motion.h1
            className="text-8xl md:text-9xl lg:text-[14rem] font-black tracking-tighter leading-none"
            style={{
              background: "linear-gradient(135deg, #fda4af 0%, #fb7185 25%, #f43f5e 50%, #ec4899 75%, #fb923c 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 80px rgba(244, 63, 94, 0.5)",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            OneClick
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.2,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <motion.h2
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mt-2 leading-none"
            style={{
              background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 30%, #fb923c 60%, #fbbf24 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 80px rgba(236, 72, 153, 0.5)",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
              delay: 0.3,
            }}
          >
            API Builder
          </motion.h2>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "300px", opacity: 1 }}
          transition={{
            duration: 1.5,
            delay: 0.8,
          }}
        />

      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-rose-950/30 to-transparent" />
    </div>
  );
}