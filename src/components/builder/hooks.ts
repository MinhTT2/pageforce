import { useEffect, useRef, useSyncExternalStore } from "react";

export function usePublicOrigin() {
  return useSyncExternalStore(subscribeToOrigin, getBrowserOrigin, getServerOrigin);
}

function subscribeToOrigin(onStoreChange: () => void) {
  const timeoutId = window.setTimeout(onStoreChange, 0);

  return () => window.clearTimeout(timeoutId);
}

function getBrowserOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return "";
}

export function useSaveShortcut(onSave: () => void) {
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  });

  // Subscribe once; the ref keeps the handler current without re-binding the
  // window listener on every render.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        onSaveRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

export function useUndoRedoShortcuts(onUndo: () => void, onRedo: () => void) {
  const onUndoRef = useRef(onUndo);
  const onRedoRef = useRef(onRedo);

  useEffect(() => {
    onUndoRef.current = onUndo;
    onRedoRef.current = onRedo;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedoRef.current();
        } else {
          onUndoRef.current();
        }
      }

      if (event.ctrlKey && key === "y") {
        event.preventDefault();
        onRedoRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;

  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.isContentEditable
  );
}

export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);
}
