"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_EMBED_URL =
  "https://www.youtube-nocookie.com/embed/equupu5HFyk?autoplay=1&rel=0";

export default function WatchDemoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeDialog() {
    dialogRef.current?.close();
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/75 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-blue-300 hover:text-blue-700 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[8px] text-white dark:bg-white dark:text-slate-950">
          ▶
        </span>
        Watch Demo
      </button>

      {isOpen ? (
        <dialog
          ref={dialogRef}
          aria-labelledby="watch-demo-title"
          onCancel={(event) => {
            event.preventDefault();
            closeDialog();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
          onClose={() => setIsOpen(false)}
          className="m-auto w-[calc(100%-2rem)] max-w-5xl overflow-visible rounded-[1.5rem] border border-white/15 bg-slate-950 p-2 text-white shadow-[0_30px_100px_rgba(2,6,23,0.7)] backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm sm:p-3"
        >
          <div className="relative overflow-hidden rounded-[1.1rem] bg-black">
            <h2 id="watch-demo-title" className="sr-only">
              AI Sales Companion demo video
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDialog}
              aria-label="Close demo video"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-slate-950/75 text-2xl leading-none text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-slate-900 sm:right-4 sm:top-4"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={VIDEO_EMBED_URL}
                title="AI Sales Companion demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
