import React, { useState, useRef } from 'react';

export default function AIUploadScreen({ onAnalyze, onNavigate, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setFileError(null);
    if (!file) return;

    const isImageType =
      !file.type ||
      file.type.startsWith('image/') ||
      file.type === 'application/octet-stream' ||
      /\.(jpe?g|png|webp|heic|heif|bmp|gif|jfif)$/i.test(file.name);

    if (!isImageType) {
      setFileError('Please upload a valid image screenshot (PNG, JPEG, WebP, or HEIC).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError('Image is too large (maximum 25MB allowed).');
      return;
    }

    setSelectedFile(file);
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } catch (e) {
      // Fallback if URL.createObjectURL is unsupported
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError(null);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select or drop an attendance screenshot first.');
      return;
    }
    onAnalyze(selectedFile);
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          aria-label="Go Back"
          onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold text-xs py-1 hover:underline"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
          <span>Back to Home</span>
        </button>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          OCR Engine v2.4
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          AI Attendance Scanner
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Upload a screenshot of your college ERP or attendance portal table.
        </p>
      </div>

      {/* Dropzone */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-slate-800/90 p-6 shadow-sm transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-500 ${
            dragActive ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          <div className="relative flex flex-col items-center justify-center text-center py-4 px-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                add_photo_alternate
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Drag &amp; drop or tap to browse screenshot
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
              Automatic OCR parsing for LMS, ERP, CollPoll, and Moodle tables
            </span>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">description</span>
              <span>JPG, PNG, WebP up to 20MB</span>
            </div>
          </div>
        </div>
      ) : (
        /* Ready File Preview Card */
        <div className="rounded-2xl bg-white dark:bg-slate-800/90 p-4 shadow-sm flex flex-col gap-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {selectedFile.name}
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold shrink-0">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              Ready
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 max-h-56 flex items-center justify-center border border-slate-200 dark:border-slate-800">
            <img
              src={previewUrl}
              alt="Screenshot Preview"
              className="max-h-56 w-full object-contain p-2"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              type="button"
            >
              Replace Image
            </button>
            <button
              onClick={handleRemove}
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
              type="button"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {fileError && (
        <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{fileError}</span>
        </div>
      )}

      {/* Live Analyzing Box (active when isLoading) */}
      {isLoading && (
        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-4 shadow-sm space-y-3 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Reading attendance table...</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Extracting subject rows and present counts</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Vision AI</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out animate-pulse" style={{ width: '85%' }}></div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Subjects</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Auto-detect</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Total Count</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Summing...</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Target</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">75% Goal</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isLoading}
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          type="button"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              <span>Analyzing with Vision AI...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span>Analyze with AI</span>
            </>
          )}
        </button>

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[16px] shrink-0 mt-0.5">lock</span>
          <p className="leading-relaxed">
            <strong className="font-semibold text-slate-700 dark:text-slate-300">Private &amp; Secure:</strong> Screenshots are processed ephemerally and never stored or shared.
          </p>
        </div>
      </div>
    </div>
  );
}
