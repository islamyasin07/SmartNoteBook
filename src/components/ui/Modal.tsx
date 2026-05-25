import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export const Modal = ({
  open,
  title,
  onClose,
  children,
  widthClass = 'max-w-4xl'
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`glass-panel relative w-full ${widthClass} max-h-[90vh] overflow-y-auto rounded-[2rem] p-5 lg:p-6`}
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button className="glass-button-secondary" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);