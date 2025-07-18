import ParticleBackground from "@/components/ParticleBackground";
import { Github, Instagram, Mail } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Profile Picture */}
        <div className="mb-8">
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F0f77a85690ee493ca3836b76d0a61491%2Fa0568744dc05492caff995edd8662ab8?format=webp&width=800"
              alt="Phurin Phuangsai"
              className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-lg shadow-black/20"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          {/* Hello with waving emoji */}
          <h1 className="text-white text-2xl md:text-3xl font-light">
            Hello <span className="inline-block animate-bounce">👋</span>
          </h1>

          {/* I'm */}
          <h2 className="text-white text-xl md:text-2xl font-light">I'm</h2>

          {/* Name with gradient */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Phurin Phuangsai
          </h2>

          {/* University */}
          <p className="text-white text-sm md:text-base font-light opacity-90 max-w-md mx-auto">
            Student in Comsci, Chulalongkorn University
          </p>

          {/* Let and learn */}
          <p className="text-white text-sm md:text-base font-light opacity-90">
            let and learn
          </p>
        </div>

        {/* Contact Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <a
            href="https://www.instagram.com/_palmdiary/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Instagram className="w-5 h-5" />
            <span className="font-medium">Instagram</span>
          </a>

          <a
            href="https://github.com/phurincode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Github className="w-5 h-5" />
            <span className="font-medium">GitHub</span>
          </a>

          <a
            href="mailto:phuangsaiphurin2550@gmail.com"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Email</span>
          </a>
        </div>
      </div>
    </div>
  );
}
