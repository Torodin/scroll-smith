import { useEffect, useRef, useState } from "react";

function DeleteCharacterDialog({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const confirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the character.");
      setPending(false);
    }
  };

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-delete-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
    >
      <h2 id="confirm-delete-title">Delete {name}?</h2>
      <p>This permanently removes the character and cannot be undone.</p>
      {error ? <p role="alert">{error}</p> : null}
      <div className="confirm-actions">
        <button className="button" type="button" onClick={onCancel} disabled={pending}>
          Cancel
        </button>
        <button
          className="button button-danger"
          type="button"
          onClick={() => void confirm()}
          disabled={pending}
        >
          {pending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </dialog>
  );
}

export default DeleteCharacterDialog;
