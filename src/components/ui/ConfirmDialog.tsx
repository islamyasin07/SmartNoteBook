import { Modal } from './Modal';

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  return (
    <Modal open={open} title={title} onClose={onClose} widthClass="max-w-lg">
      <p className="text-sm leading-7 text-slate-300">{description}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button className="glass-button-secondary" onClick={onClose}>
          {cancelLabel}
        </button>
        <button className="glass-button-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};