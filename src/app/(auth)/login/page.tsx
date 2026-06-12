"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Brain,
} from "lucide-react";

import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 p-6">
      
      {/* BACKGROUND BLUR */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-300/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl"></div>

      {/* FLOATING ICONS */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-24 left-20 hidden lg:flex"
      >
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <BookOpen className="w-8 h-8 text-sky-500" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-32 left-32 hidden lg:flex"
      >
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute top-40 right-24 hidden lg:flex"
      >
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <Brain className="w-8 h-8 text-cyan-500" />
        </div>
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-24 right-40 hidden lg:flex"
      >
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg">
          <Sparkles className="w-8 h-8 text-sky-400" />
        </div>
      </motion.div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-2xl bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 md:p-14"
      >
        {/* TOP LIGHT EFFECT */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 rounded-t-3xl"></div>

        {/* HEADER */}
        <div className="text-center mb-10">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="w-24 h-24 bg-gradient-to-br from-sky-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <GraduationCap className="w-12 h-12 text-sky-600" />
          </motion.div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            EduCenter
          </h1>

          <p className="text-gray-500 mt-4 text-lg">
            Hệ thống quản lý học tập hiện đại
          </p>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-[2px] w-16 bg-sky-200 rounded-full"></div>

          <div className="w-3 h-3 bg-sky-500 rounded-full"></div>

          <div className="h-[2px] w-16 bg-sky-200 rounded-full"></div>
        </div>

        {/* FORM */}
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center text-sm text-gray-400">
          © 2026 EduCenter. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}