"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { useOnViewportChange, useReactFlow } from "@xyflow/react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;
const ZOOM_FACTOR = 1.35;
const FIT = { padding: 0.22, duration: 280, maxZoom: 1.15, minZoom: MIN_ZOOM } as const;

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function useHoldRepeat(action: () => void) {
  const hold = useRef<number | null>(null);
  const stop = useCallback(() => {
    if (hold.current != null) {
      window.clearInterval(hold.current);
      hold.current = null;
    }
  }, []);
  const start = useCallback(() => {
    action();
    stop();
    hold.current = window.setInterval(action, 110);
  }, [action, stop]);
  useEffect(() => stop, [stop]);
  return {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      start();
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  };
}

export function TreeZoomControls({ arrangeToken }: { arrangeToken: number }) {
  const { zoomTo, getZoom, fitView } = useReactFlow();
  const [zoom, setZoom] = useState(1);

  useOnViewportChange({
    onChange: (viewport) => setZoom(viewport.zoom),
    onEnd: (viewport) => setZoom(viewport.zoom),
  });

  useEffect(() => {
    if (!arrangeToken) return;
    const frame = window.requestAnimationFrame(() => {
      void fitView(FIT);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [arrangeToken, fitView]);

  const animateTo = useCallback(
    (next: number) => {
      void zoomTo(clampZoom(next), { duration: 160 });
    },
    [zoomTo]
  );

  const zoomIn = useCallback(() => {
    animateTo(getZoom() * ZOOM_FACTOR);
  }, [animateTo, getZoom]);

  const zoomOut = useCallback(() => {
    animateTo(getZoom() / ZOOM_FACTOR);
  }, [animateTo, getZoom]);

  const fit = useCallback(() => {
    void fitView(FIT);
  }, [fitView]);

  const holdIn = useHoldRepeat(zoomIn);
  const holdOut = useHoldRepeat(zoomOut);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomIn();
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomOut();
      } else if (event.key === "0" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        fit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fit, zoomIn, zoomOut]);

  const percent = Math.round(zoom * 100);

  return (
    <div className="pointer-events-none absolute right-3 bottom-3 z-10 flex flex-col items-end gap-2 sm:right-4 sm:bottom-4">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-card/95 p-1 shadow-lg ring-1 ring-gold/45 backdrop-blur-sm">
        <Button
          type="button"
          size="icon-lg"
          variant="ghost"
          className="size-11 rounded-full text-maroon"
          aria-label="Zoom out"
          title="Zoom out (−)"
          {...holdOut}
        >
          <Minus className="size-5" />
        </Button>
        <button
          type="button"
          className="min-w-14 px-1 text-center text-sm font-medium tabular-nums text-maroon"
          aria-label={`Zoom ${percent} percent. Click to fit the tree.`}
          title="Fit tree (0)"
          onClick={fit}
        >
          {percent}%
        </button>
        <Button
          type="button"
          size="icon-lg"
          variant="ghost"
          className="size-11 rounded-full text-maroon"
          aria-label="Zoom in"
          title="Zoom in (+)"
          {...holdIn}
        >
          <Plus className="size-5" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mr-0.5 h-11 rounded-full px-4"
          onClick={fit}
        >
          <Maximize2 data-icon="inline-start" />
          Fit
        </Button>
      </div>
      <label className="pointer-events-auto flex w-[11.5rem] items-center gap-2 rounded-full bg-card/95 px-3 py-2 shadow-md ring-1 ring-gold/35 backdrop-blur-sm sm:w-52">
        <span className="sr-only">Zoom level</span>
        <Minus className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.05}
          value={clampZoom(zoom)}
          aria-valuemin={Math.round(MIN_ZOOM * 100)}
          aria-valuemax={Math.round(MAX_ZOOM * 100)}
          aria-valuenow={percent}
          aria-label="Zoom slider"
          className="h-2 w-full cursor-pointer accent-maroon"
          onChange={(event) => {
            const next = Number(event.target.value);
            setZoom(next);
            void zoomTo(next);
          }}
        />
        <Plus className="size-3.5 shrink-0 text-muted-foreground" />
      </label>
    </div>
  );
}

export const TREE_FLOW_ZOOM = {
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  fitViewOptions: { padding: 0.22, maxZoom: 1.15 },
} as const;
