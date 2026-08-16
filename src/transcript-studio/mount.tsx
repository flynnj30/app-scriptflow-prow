import React, { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./App";
import styles from "./index.css?inline";

const roots = new WeakMap<HTMLElement, { root: Root; shadow: ShadowRoot }>();

export function mount(host: HTMLElement) {
  const existing = roots.get(host);
  if (existing) return () => unmount(host);

  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  shadow.innerHTML = "";
  const style = document.createElement("style");
  style.textContent = `:host{display:block;width:100%;height:100%;contain:layout style paint;} ${styles}`;
  shadow.appendChild(style);
  const rootNode = document.createElement("div");
  rootNode.id = "transcript-studio-root";
  rootNode.style.cssText = "width:100%;height:100%;min-height:0;";
  shadow.appendChild(rootNode);
  const root = createRoot(rootNode);
  root.render(<StrictMode><App /></StrictMode>);
  roots.set(host, { root, shadow });
  return () => unmount(host);
}

export function unmount(host: HTMLElement) {
  const record = roots.get(host);
  if (!record) return;
  record.root.unmount();
  host.shadowRoot?.replaceChildren();
  roots.delete(host);
}

export const mountTranscriptStudio = mount;
export const unmountTranscriptStudio = unmount;
export default { mount, unmount };
