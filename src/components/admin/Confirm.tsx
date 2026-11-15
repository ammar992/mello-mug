"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Btn, Modal } from "./ui";

type Options = { title: string; message?: string; confirmLabel?: string; danger?: boolean };
type ConfirmFn = (o: Options) => Promise<boolean>;

const Ctx = createContext<ConfirmFn>(async () => false);

/** `const confirm = useConfirm(); if (await confirm({...})) ...` */
export function useConfirm() {
  return useContext(Ctx);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<Options | null>(null);
  const resolver = useRef<(v: boolean) => void>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <Modal
        elevated
        open={Boolean(opts)}
        onClose={() => close(false)}
        title={opts?.title ?? ""}
        footer={
          <>
            <Btn variant="secondary" onClick={() => close(false)}>Cancel</Btn>
            <Btn variant={opts?.danger ? "danger" : "primary"} onClick={() => close(true)} autoFocus>
              {opts?.confirmLabel ?? "Confirm"}
            </Btn>
          </>
        }
      >
        <p className="text-slate">{opts?.message}</p>
      </Modal>
    </Ctx.Provider>
  );
}
