import { useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    document_type: string;
  }>;
  initialIndex?: number;
  canDownload?: boolean;
  onDownload?: (docId: string) => void;
}

export function DocumentViewer({
  isOpen,
  onClose,
  documents,
  initialIndex = 0,
  canDownload = false,
  onDownload
}: DocumentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDoc = documents[currentIndex];

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + documents.length) % documents.length);
    setZoom(1);
    setRotation(0);
    setIsLoading(true);
    setError(null);
  }, [documents.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % documents.length);
    setZoom(1);
    setRotation(0);
    setIsLoading(true);
    setError(null);
  }, [documents.length]);

  const handleDownload = useCallback(() => {
    if (onDownload && currentDoc) {
      onDownload(currentDoc.id);
    }
  }, [currentDoc, onDownload]);

  const handlePrint = useCallback(() => {
    if (currentDoc) {
      const printWindow = window.open(currentDoc.file_url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  }, [currentDoc]);

  const isImage = currentDoc?.file_type?.startsWith('image/');
  const isPDF = currentDoc?.file_type === 'application/pdf';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-slate-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-white font-semibold truncate max-w-md">
                  {currentDoc?.file_name}
                </h3>
                <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                  {currentDoc?.document_type}
                </span>
                <span className="text-sm text-slate-400">
                  {currentIndex + 1} of {documents.length}
                </span>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Navigation */}
            {documents.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700/80 transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700/80 transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Document Container */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-slate-900/50">
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-300">Loading document...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-red-400">
                      <p className="text-lg font-semibold mb-2">Error Loading Document</p>
                      <p className="text-sm text-slate-400">{error}</p>
                    </div>
                  </div>
                )}

                {!error && isImage && (
                  <img
                    src={currentDoc.file_url}
                    alt={currentDoc.file_name}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease'
                    }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setError('Failed to load image');
                    }}
                  />
                )}

                {!error && isPDF && (
                  <iframe
                    src={currentDoc.file_url}
                    className="w-full h-full min-w-[800px] min-h-[600px] shadow-2xl"
                    style={{
                      transform: `scale(${zoom})`,
                      transition: 'transform 0.3s ease'
                    }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                      setError('Failed to load PDF');
                    }}
                  />
                )}
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-t border-slate-700 px-4 py-3">
              <div className="flex items-center justify-center space-x-2">
                {/* Zoom Controls */}
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className={cn(
                    "p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors",
                    zoom <= 0.5 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                
                <span className="px-3 py-1 text-sm font-mono bg-slate-800/80 text-slate-300 rounded-lg min-w-[80px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className={cn(
                    "p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors",
                    zoom >= 3 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-slate-700 mx-2"></div>

                {/* Rotate Control */}
                <button
                  onClick={handleRotate}
                  className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                {/* Reset Control */}
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors"
                >
                  <span className="text-sm font-medium">Reset</span>
                </button>

                <div className="w-px h-6 bg-slate-700 mx-2"></div>

                {/* Action Controls */}
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg bg-blue-600/50 text-blue-300 hover:bg-blue-600/70 transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-5 h-5" />
                  <span className="text-sm font-medium">Print</span>
                </button>

                {canDownload && (
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-green-600/50 text-green-300 hover:bg-green-600/70 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                )}
              </div>

              {/* Zoom Slider (Alternative Control) */}
              <div className="mt-3 flex items-center space-x-3">
                <span className="text-xs text-slate-400">Zoom:</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="space-y-1">
              <div><kbd className="px-1 py-0.5 bg-slate-700 rounded">←</kbd> <kbd className="px-1 py-0.5 bg-slate-700 rounded">→</kbd> Navigate</div>
              <div><kbd className="px-1 py-0.5 bg-slate-700 rounded">+</kbd> <kbd className="px-1 py-0.5 bg-slate-700 rounded">-</kbd> Zoom</div>
              <div><kbd className="px-1 py-0.5 bg-slate-700 rounded">ESC</kbd> Close</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}