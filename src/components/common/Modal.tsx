import React, { useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  mobileTitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  modalStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  closeButtonStyle?: React.CSSProperties;
  borderRadius?: string;
  fullScreenMobile?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  mobileTitle,
  children,
  maxWidth = 'lg',
  modalStyle,
  headerStyle,
  titleStyle,
  closeButtonStyle,
  borderRadius,
  fullScreenMobile = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={
            fullScreenMobile
              ? 'fixed inset-0 z-50 flex flex-col bg-white sm:bg-transparent sm:p-4 sm:p-6 sm:items-center sm:justify-center sm:overflow-y-auto no-scrollbar'
              : 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto no-scrollbar p-4 sm:p-6'
          }
        >
          {/* Backdrop (visible on desktop or non-fullscreen) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 bg-neutral-900/60 backdrop-blur-xs ${
              fullScreenMobile ? 'hidden sm:block' : 'block'
            }`}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: fullScreenMobile ? 1 : 0.95, y: fullScreenMobile ? 20 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: fullScreenMobile ? 1 : 0.95, y: fullScreenMobile ? 20 : 10 }}
            transition={{ type: 'spring', duration: 0.25 }}
            className={
              fullScreenMobile
                ? `relative w-full h-full sm:h-auto flex flex-col bg-white shadow-none sm:shadow-2xl sm:ring-1 sm:ring-black/5 ${
                    widthClasses[maxWidth]
                  } ${borderRadius ? '' : 'sm:rounded-2xl'} overflow-hidden`
                : `relative w-full ${widthClasses[maxWidth]} overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 ${
                    borderRadius ? '' : 'rounded-2xl'
                  }`
            }
            style={{ borderRadius: fullScreenMobile ? undefined : borderRadius, ...modalStyle }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200/90 bg-white/98 backdrop-blur-md px-3.5 py-3 sm:px-6 sm:py-5 shrink-0"
              style={headerStyle}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {fullScreenMobile && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:hidden rounded-xl p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all shrink-0"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 truncate" style={titleStyle}>
                    {mobileTitle || title}
                  </h3>
                  {subtitle && (
                    <p className={`mt-0.5 text-xs text-neutral-500 truncate ${fullScreenMobile ? 'hidden sm:block' : 'block'}`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:scale-95 transition-all shrink-0 ml-2"
                style={closeButtonStyle}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div
              className={
                fullScreenMobile
                  ? 'flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 sm:max-h-[80vh]'
                  : 'max-h-[80vh] overflow-y-auto no-scrollbar p-5 sm:p-6'
              }
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

