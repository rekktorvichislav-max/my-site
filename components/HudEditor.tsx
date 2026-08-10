"use client";

import { useEffect, useRef, useState } from "react";

interface HudData {
  x: number;
  y: number;
}

export function HudEditor({ userId, username, uid }: { userId: number; username: string; uid: string | null }) {
  const key = `hud:${userId}`;

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw) as HudData;
        if (typeof data.x === "number" && typeof data.y === "number") {
          setPos({ x: data.x, y: data.y });
        }
      }
    } catch {
      // ignore
    }
    if (!localStorage.getItem(key)) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPos({ x: w - 296, y: Math.max(100, Math.round(h / 2) - 120) });
    }
  }, [key]);

  function persist(data: HudData) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    const el = e.target as HTMLElement;
    if (el.closest("[data-no-drag]")) return;
    if (!pos) return;
    e.preventDefault();
    dragStart.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging || !dragStart.current) return;
    function move(e: PointerEvent) {
      const s = dragStart.current;
      if (!s || !pos) return;
      const nx = Math.min(Math.max(0, s.origX + e.clientX - s.startX), window.innerWidth - 40);
      const ny = Math.min(Math.max(0, s.origY + e.clientY - s.startY), window.innerHeight - 40);
      setPos({ x: nx, y: ny });
    }
    function up() {
      const s = dragStart.current;
      dragStart.current = null;
      setDragging(false);
      if (s && pos) persist({ x: pos.x, y: pos.y });
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const defaultStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { right: 24, top: "50%", transform: "translateY(-50%)" };

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: "fixed",
        zIndex: 40,
        width: 250,
        userSelect: "none",
        touchAction: "none",
        cursor: dragging ? "grabbing" : "grab",
        ...defaultStyle,
      }}
    >
      <div
        style={{
          background: "rgba(14,14,14,0.85)",
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: 12,
          padding: "12px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 24px rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "5px 12px",
            }}
          >
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{username}</span>
            <span style={{ color: "var(--muted)", fontSize: 11, fontFamily: "monospace" }}>UID {uid}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted)", cursor: "grab" }}>⠿</span>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ color: "#e0e0e0", fontSize: 13 }}>♥</span>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>20/20</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: 2, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div
              style={{
                height: 12,
                borderRadius: 4,
                width: "100%",
                background: "linear-gradient(90deg, #d9d9d9, #b0b0b0)",
                boxShadow: "0 0 14px rgba(255,255,255,0.3)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
