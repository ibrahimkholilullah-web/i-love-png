export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 pb-6 pt-4 px-4 z-10 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-6 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl text-xs text-slate-400">
        
        {/* Copyright & Creator Info */}
        <p className="tracking-wide text-center sm:text-left">
          © {new Date().getFullYear()} <span className="text-slate-200 font-semibold">PDF2JPG Pro</span>. Built with ❤️ by{' '}
          <span className="text-blue-400 font-medium">Ibrahim Kholilullah</span>
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/ibrahim-kholilullah55/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors duration-300"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span>LinkedIn</span>
          </a>

          <span className="text-slate-700">•</span>

          {/* GitHub */}
          <a
            href="https://github.com/ibrahimkholilullah-web"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-300"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>

      </div>
    </footer>
  );
}