import React, { useState, useRef } from 'react';
import { Upload, Camera, Trash2, ArrowLeft, ArrowRight, Star, AlertCircle, Image as ImageIcon, Sparkles, Plus, Check } from 'lucide-react';
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
  description = 'Upload product photos. Choose the primary image that will be shown on product cards.',
  maxImages = 10,
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

  const handleFiles = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMsg(null);

    const filesArray = Array.from(filesList);
    const availableSlots = maxImages - value.length;

    if (availableSlots <= 0) {
      setErrorMsg(`Maximum gallery limit reached (${maxImages} images). Remove an existing image to upload more.`);
      return;
    }

    const filesToProcess = filesArray.slice(0, availableSlots);
    setIsProcessing(true);

    const newImages: string[] = [];
    let successCount = 0;
    let failError: string | null = null;

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      setUploadStatus(`Processing image ${i + 1} of ${filesToProcess.length}...`);

      try {
        const processed = await processImageFile(file, { maxSizeBytes });
        newImages.push(processed.dataUrl);
        successCount++;
      } catch (err: any) {
        failError = err.message || `Failed to process ${file.name}`;
      }
    }

    setIsProcessing(false);
    setUploadStatus('');

    if (newImages.length > 0) {
      onChange([...value, ...newImages]);
    }

    if (failError) {
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
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = value[index];
    const remaining = value.filter((_, i) => i !== index);
    onChange([selected, ...remaining]);
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
          <label className="block text-xs font-bold text-neutral-800">{label}</label>
          <span className="text-[10px] text-neutral-400 font-medium">
            {value.length} / {maxImages} images uploaded
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

            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-2xl border bg-white transition-all shadow-2xs ${
                  isPrimary ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`Upload ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Primary Badge */}
                  {allowPrimarySelection && isPrimary && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                      <Star className="h-3 w-3 fill-current" /> Primary Cover
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="rounded-lg bg-rose-600 p-1.5 text-white shadow-md hover:bg-rose-700 transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveLeft(idx)}
                            className="rounded-lg bg-white/90 p-1 text-neutral-800 shadow-sm hover:bg-white"
                            title="Move Left"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                        )}
                        {idx < value.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveRight(idx)}
                            className="rounded-lg bg-white/90 p-1 text-neutral-800 shadow-sm hover:bg-white"
                            title="Move Right"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {allowPrimarySelection && !isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-700"
                        >
                          <Star className="h-2.5 w-2.5" /> Make Primary
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2 text-[10px] font-semibold text-neutral-500 flex items-center justify-between bg-neutral-50 border-t border-neutral-100">
                  <span>Photo #{idx + 1}</span>
                  {isPrimary && <span className="text-emerald-700 font-extrabold uppercase">Main</span>}
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
              : 'border-neutral-200 bg-neutral-50/80 hover:border-neutral-400 hover:bg-neutral-100'
          }`}
        >
          {isProcessing ? (
            <div className="py-3 space-y-2">
              <Sparkles className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-neutral-800">{uploadStatus || 'Processing images...'}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-neutral-200 text-emerald-600 shadow-2xs">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    {value.length === 0 ? 'Upload Product Photos from Device' : 'Add More Photos'}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Drag & drop multiple files, select from gallery, or capture photo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-all"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Browse Photos</span>
                </button>

                {allowCamera && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-all"
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
