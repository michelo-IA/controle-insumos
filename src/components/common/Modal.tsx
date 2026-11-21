import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-md',
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setAnimatingOut(false);

      // Trava rolagem do body compensando a largura da barra de rolagem para evitar layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    } else if (mounted) {
      setAnimatingOut(true);
      const timer = setTimeout(() => {
        setMounted(false);
        setAnimatingOut(false);
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    // Tecla ESC para fechar modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalElement = (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-all duration-150 ${
        animatingOut ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
    >
      <div
        onClick={handleBackdropClick}
        className="min-h-full w-full flex items-center justify-center p-4 sm:p-6 text-center"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-2xl text-left shadow-2xl border border-slate-200 w-full overflow-hidden my-auto transition-all duration-150 ${maxWidth} ${
            animatingOut ? 'animate-scaleOut' : 'animate-scaleIn'
          } ${className}`}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};
