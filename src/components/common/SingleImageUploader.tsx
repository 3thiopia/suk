import React, { useState, useRef } from 'react';
import { Upload, Camera, Trash2, RefreshCw, CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, FileText } from 'lucide-react';
import { processImageFile, formatBytes } from '../../lib/imageUtils';

interface SingleImageUploaderProps {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: 'square' | 'banner' | 'avatar' | '3:2' | '4:3' | 'auto';
  maxSizeBytes?: number;
  accept?: string;
  allowCamera?: boolean;
  helpText?: string;
  placeholderText?: string;
  className?: string;
}

export function SingleImageUploader({
  value,
  onChange,
  label,
  description,
  aspectRatio = 'square',
  maxSizeBytes = 10 * 1024 * 1024,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/svg+xml',
  allowCamera = true,
  helpText = 'Supports JPG, PNG, WEBP, SVG up to 10MB',
  placeholderText = 'Drag & drop image here or click to browse',
  className = '',
}: SingleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [metaInfo, setMetaInfo] = useState<{ name?: string; size?: number } | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setErrorMsg(null);
    setIsProcessing(true);
    setUploadProgress(20);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 25 : prev));
      }, 80);

      const processed = await processImageFile(file, { maxSizeBytes });
      clearInterval(interval);

      setUploadProgress(100);
      setTimeout(() => {
        onChange(processed.dataUrl);
        setMetaInfo({ name: processed.name, size: processed.size });
        setIsProcessing(false);
        setUploadProgress(0);
      }, 150);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process image file.');
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setMetaInfo(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Aspect ratio styling
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'banner':
        return 'h-36 sm:h-44 w-full';
      case 'avatar':
        return 'h-24 w-24 rounded-full';
      case '3:2':
        return 'aspect-[3/2] w-full';
      case '4:3':
        return 'aspect-[4/3] w-full';
      case 'square':
        return 'aspect-square w-full max-w-[240px]';
      case 'auto':
      default:
        return 'min-h-[140px] w-full';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Subtitle */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-800">{label}</label>
          {helpText && <span className="text-[10px] text-neutral-400 font-medium">{helpText}</span>}
        </div>
      )}
      {description && <p className="text-[11px] text-neutral-500 leading-snug">{description}</p>}

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />
      {allowCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p>{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Upload / Preview Area */}
      {value ? (
        /* Image Preview State */
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900/5 shadow-2xs transition-all">
          <div className={`relative flex items-center justify-center overflow-hidden ${getAspectRatioClass()}`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-neutral-900 shadow-md backdrop-blur-xs hover:bg-white transition-all transform hover:scale-105"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all transform hover:scale-105"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>

          {/* Meta Bar */}
          <div className="flex items-center justify-between border-t border-neutral-200/80 bg-white px-3.5 py-2 text-[11px] font-medium text-neutral-600">
            <div className="flex items-center gap-2 truncate">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate font-semibold text-neutral-800">
                {metaInfo?.name || 'Image uploaded directly from device'}
              </span>
              {metaInfo?.size && (
                <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
                  {formatBytes(metaInfo.size)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-neutral-200 bg-neutral-50/80 hover:border-neutral-400 hover:bg-neutral-100/70'
          }`}
        >
          {isProcessing ? (
            <div className="py-4 space-y-3">
              <Sparkles className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-neutral-800">Optimizing & Uploading Image...</p>
              <div className="mx-auto w-48 overflow-hidden rounded-full bg-neutral-200 h-1.5">
                <div
                  className="bg-emerald-600 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xs border border-neutral-200 text-neutral-700">
                <Upload className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-900">{placeholderText}</p>
                <p className="text-[11px] text-neutral-500 mt-1">Select from photo gallery or drop image file</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-all"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Browse Device</span>
                </button>

                {allowCamera && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-all"
                  >
                    <Camera className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Take Photo</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
