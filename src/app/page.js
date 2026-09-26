'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conversionCount, setConversionCount] = useState(0);

  // Load saved conversion count from localStorage on component mount
  useEffect(() => {
    const savedCount = localStorage.getItem('pdf_conversion_count');
    if (savedCount) {
      setConversionCount(parseInt(savedCount, 10));
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const convertPdfToJpg = async () => {
    if (!file) return;

    setLoading(true);
    setImages([]);

    try {
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      
      // Document loading task
      let loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

      // Handle password protected PDFs
      loadingTask.onPassword = (updatePassword, reason) => {
        if (
          reason === pdfjsLib.PasswordResponses.NEED_PASSWORD ||
          reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD
        ) {
          const userPassword = prompt(
            reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD
              ? 'Incorrect password. Please enter the correct password:'
              : 'This PDF is password protected. Please enter the password:'
          );

          if (userPassword) {
            updatePassword(userPassword);
          } else {
            throw new Error('PASSWORD_CANCELLED');
          }
        }
      };

      const pdf = await loadingTask.promise;
      const convertedImages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg');
        convertedImages.push(imgData);
      }

      setImages(convertedImages);

      // Increment and update conversion count
      setConversionCount((prevCount) => {
        const newCount = prevCount + 1;
        localStorage.setItem('pdf_conversion_count', newCount.toString());
        return newCount;
      });

    } catch (error) {
      console.error('Error converting PDF:', error);
      if (error.message === 'PASSWORD_CANCELLED') {
        alert('Conversion cancelled: Password required.');
      } else if (error.name === 'PasswordException') {
        alert('Incorrect password! Could not open PDF.');
      } else {
        alert('Failed to convert PDF file!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-slate-950 text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Animated Light Effects */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto z-10 flex flex-col items-center my-auto">
        
        {/* Title & Subtitle */}
        <div className="text-center mb-6 sm:mb-8 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200 leading-tight">
            Convert PDF to High-Quality JPG
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto px-2">
            Transform your document pages into clean image files instantly in your browser.
          </p>

          {/* Conversion Counter Display */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs sm:text-sm text-slate-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Total Conversions:</span>
            <span className="font-bold text-blue-400">{conversionCount}</span>
          </div>
        </div>

        {/* Main Converter Card */}
        <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative transition-all duration-300 hover:border-white/20">
          
          {/* File Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group ${
              isDragging
                ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700 hover:border-blue-400/80 bg-slate-950/50 hover:bg-slate-950/80'
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {!file ? (
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:bg-blue-500/20 transition duration-300 border border-blue-500/20">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-base sm:text-lg font-semibold text-slate-200 mb-1">
                  Drag & Drop your PDF file here
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  or <span className="text-blue-400 underline font-medium">browse files</span> from your computer
                </p>
              </>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4 text-left z-10 w-full max-w-md justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-xl flex-shrink-0 flex items-center justify-center border border-emerald-500/30">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base text-slate-100 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Convert Button */}
          <button
            onClick={convertPdfToJpg}
            disabled={!file || loading}
            className={`w-full mt-4 sm:mt-6 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base tracking-wide transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
              !file || loading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Converting PDF Pages...</span>
              </>
            ) : (
              <span>Convert to JPG</span>
            )}
          </button>
        </div>

        {/* Result Section */}
        {images.length > 0 && (
          <section className="w-full max-w-5xl mt-8 sm:mt-12">
            <div className="flex justify-between items-center mb-4 sm:mb-6 px-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span>Converted Pages</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-medium">
                  {images.length} {images.length === 1 ? 'Page' : 'Pages'}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {images.map((imgSrc, index) => (
                <div
                  key={index}
                  className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col justify-between hover:border-white/20 transition duration-300 group"
                >
                  <div className="overflow-hidden rounded-lg bg-black/40 mb-3 sm:mb-4 border border-white/5">
                    <img
                      src={imgSrc}
                      alt={`Page ${index + 1}`}
                      className="w-full h-auto object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <a
                    href={imgSrc}
                    download={`page-${index + 1}.jpg`}
                    className="w-full py-2 sm:py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition duration-300 hover:scale-[1.02]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Page {index + 1}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}