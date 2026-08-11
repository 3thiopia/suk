import React, { useState, useRef } from 'react';
import { Upload, Camera, Trash2, ArrowLeft, ArrowRight, Star, AlertCircle, Image as ImageIcon, Sparkles, Plus, Check, MoreVertical, X } from 'lucide-react';
import { processImageFile, formatBytes } from '../../lib/imageUtils';

interface MultiImageUploaderProps {
  value: string[];
  onChange: (images: string[]) => void;
  label?: string;
  description?: string;
  maxImages?: number;
  maxSizeBytes?: number;
  allowPrimarySelection?: boolean;
  allowCamera?: boolean;
  className?: string;
}

export function MultiImageUploader({
  value = [],
  onChange,
  label = 'Product Image Gallery',
  description = 'Upload product photos. The first image will be set as the primary cover.',
  maxImages = 5,
  maxSizeBytes = 10 * 1024 * 1024,
  allowPrimarySelection = true,
  allowCamera = true,
  className = '',
}: MultiImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  const handleFiles = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMsg(null);

    const filesArray = Array.from(filesList);
    const currentCount = value.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      setErrorMsg(`Maximum limit reached (${maxImages} images total). Remove an existing image to add more.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      return;
    }

    let warningMsg: string | null = null;
    if (filesArray.length > availableSlots) {
      warningMsg = `You can add only ${availableSlots} more image${availableSlots === 1 ? '' : 's'}. A product can have a maximum of ${maxImages} images.`;
    }

    // Filter valid image types
    const validFiles: File[] = [];
    let invalidType = false;
    let tooLarge = false;

    for (const f of filesArray) {
      if (!f.type.startsWith('image/')) {
        invalidType = true;
        continue;
      }
      if (f.size > maxSizeBytes) {
        tooLarge = true;
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      if (invalidType) setErrorMsg('Invalid file format. Please upload JPG, PNG, WEBP, or SVG images.');
      else if (tooLarge) setErrorMsg(`Image size exceeds the ${formatBytes(maxSizeBytes)} limit.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      return;
    }

    const filesToProcess = validFiles.slice(0, availableSlots);
    setIsProcessing(true);

    const newImages: string[] = [];
    let failError: string | null = null;

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      setUploadStatus(`Processing image ${i + 1} of ${filesToProcess.length}...`);

      try {
        const processed = await processImageFile(file, { maxSizeBytes });
        newImages.push(processed.dataUrl);
      } catch (err: any) {
        failError = err.message || `Failed to process ${file.name}`;
      }
    }

    setIsProcessing(false);
    setUploadStatus('');

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';

    if (newImages.length > 0) {
      onChange([...value, ...newImages]);
    }

    if (warningMsg) {
      setErrorMsg(warningMsg);
    } else if (failError) {
      setErrorMsg(failError);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
    setActiveMenuIndex(null);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = value[index];
    const remaining = value.filter((_, i) => i !== index);
    onChange([selected, ...remaining]);
    setActiveMenuIndex(null);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...value];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveRight = (index: number) => {
    if (index === value.length - 1) return;
    const updated = [...value];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        className="hidden"
      />
      {allowCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          className="hidden"
        />
      )}

      {/* Label & Description */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs sm:text-sm font-bold text-neutral-800">{label}</label>
          <span className="text-[10px] sm:text-xs text-neutral-500 font-semibold bg-neutral-100 px-2 py-0.5 rounded-full">
            {value.length} / {maxImages} uploaded
          </span>
        </div>
      )}
      {description && <p className="text-[11px] text-neutral-500 leading-snug">{description}</p>}

      {/* Error Message Banner */}
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Thumbnails Grid & Primary Selection */}
      {value.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {value.map((imgUrl, idx) => {
            const isPrimary = idx === 0;
            const isMenuOpen = activeMenuIndex === idx;

            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-2xl border bg-white transition-all shadow-xs ${
                  isPrimary ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-neutral-200'
                }`}
              >
                <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`Upload ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Always visible Primary Badge */}
                  {allowPrimarySelection && isPrimary ? (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-extrabold text-white shadow-md border border-emerald-400/30">
                      <Star className="h-3 w-3 fill-current" /> ★ PRIMARY
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 z-10 rounded-lg bg-neutral-900/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      #{idx + 1}
                    </div>
                  )}

                  {/* Touch-Friendly Action Menu Button (⋮) - Always visible on mobile & desktop */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuIndex(isMenuOpen ? null : idx);
                    }}
                    aria-label="Image actions"
                    className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900/80 backdrop-blur-xs text-white shadow-md hover:bg-neutral-900 active:scale-95 transition-all"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {/* Touch Action Popover Menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute inset-0 bg-neutral-950/85 backdrop-blur-xs z-30 p-2.5 flex flex-col justify-between rounded-2xl animate-fadeIn text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                        <span className="text-[11px] font-bold text-white">Photo #{idx + 1} Options</span>
                        <button
                          type="button"
                          onClick={() => setActiveMenuIndex(null)}
                          className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 my-auto">
                        {!isPrimary && allowPrimarySelection && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 px-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                          >
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>Make Primary</span>
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveLeft(idx)}
                            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold ${
                              idx === 0
                                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                : 'bg-white/20 text-white hover:bg-white/30 active:scale-95'
                            }`}
                          >
                            <ArrowLeft className="h-3.5 w-3.5" /> Move Left
                          </button>

                          <button
                            type="button"
                            disabled={idx === value.length - 1}
                            onClick={() => handleMoveRight(idx)}
                            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold ${
                              idx === value.length - 1
                                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                : 'bg-white/20 text-white hover:bg-white/30 active:scale-95'
                            }`}
                          >
                            Move Right <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 py-2 px-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Image</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer bar with quick action buttons visible on touch/hover */}
                <div className="p-2 text-[10px] font-semibold text-neutral-600 flex items-center justify-between bg-neutral-50 border-t border-neutral-100">
                  <span className="truncate">
                    {isPrimary ? (
                      <span className="text-emerald-700 font-extrabold uppercase flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" /> Main Cover
                      </span>
                    ) : (
                      `Photo #${idx + 1}`
                    )}
                  </span>

                  <div className="flex items-center gap-1">
                    {!isPrimary && allowPrimarySelection && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded-md transition-colors"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dropzone for Uploading More */}
      {value.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : 'border-neutral-300 bg-neutral-50/80 hover:border-neutral-400 hover:bg-neutral-100/80 active:bg-neutral-100'
          }`}
        >
          {isProcessing ? (
            <div className="py-3 space-y-2">
              <Sparkles className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-neutral-800">{uploadStatus || 'Processing images...'}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
              <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-neutral-200 text-emerald-600 shadow-2xs">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900">
                    {value.length === 0 ? '+ Add Product Images' : '+ Add More Images'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Select photos from your phone gallery or take new photo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-stretch sm:justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 min-h-[42px] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span>Browse Photos</span>
                </button>

                {allowCamera && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white min-h-[42px] px-4 py-2.5 text-xs font-bold text-neutral-800 shadow-2xs hover:bg-neutral-50 active:scale-95 transition-all"
                  >
                    <Camera className="h-4 w-4 text-neutral-600" />
                    <span>Camera</span>
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

