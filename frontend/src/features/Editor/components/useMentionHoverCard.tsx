import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 🧠 useMentionHoverCard
 * Hook to handle mention card positioning, ensuring it stays within viewport boundaries.
 */
export const useMentionHoverCard = (x: number, y: number) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    top: y,
    left: x,
    opacity: 0,
    transform: "translateY(10px)",
  });

  const calculatePosition = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = y + 20;
      let left = x;

      // Prevent going off-screen logic
      if (left + rect.width > viewportWidth - 20) {
        left = viewportWidth - rect.width - 20;
      }
      if (top + rect.height > viewportHeight - 20) {
        top = y - rect.height - 10;
      }

      setStyle({
        top,
        left,
        opacity: 1,
        transform: "translateY(0)",
      });
    }
  }, [x, y]);

  useEffect(() => {
    calculatePosition();
  }, [calculatePosition]);

  const getColors = useCallback((type: string | null) => {
    const t = (type || "generic").toLowerCase();
    switch (t) {
      case "individual":
        return {
          border: "border-primary/30",
          text: "text-primary",
          bg: "bg-primary/10",
        };
      case "location":
        return {
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          bg: "bg-emerald-500/10",
        };
      case "group":
        return {
          border: "border-purple-500/20",
          text: "text-purple-400",
          bg: "bg-purple-500/10",
        };
      case "timeline":
        return {
          border: "border-orange-500/30",
          text: "text-orange-400",
          bg: "bg-orange-500/10",
        };
      case "event":
        return {
          border: "border-red-500/30",
          text: "text-red-400",
          bg: "bg-red-500/10",
        };
      case "item":
        return {
          border: "border-amber-500/30",
          text: "text-amber-400",
          bg: "bg-amber-500/10",
        };
      default:
        return {
          border: "border-foreground/10",
          text: "text-foreground/60",
          bg: "bg-foreground/5",
        };
    }
  }, []);

  return {
    cardRef,
    style,
    getColors,
  };
};
