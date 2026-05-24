import React from "react";
import MonolithicPanel from "@atoms/MonolithicPanel";
import { useSpecializedMap } from "./useSpecializedMap";

const SpecializedMap = ({
  entity,
  active,
}: {
  entity?: unknown;
  active?: boolean;
}) => {
  const { pins, handleAddPin, handleToggleLayers } = useSpecializedMap(entity);

  if (!active) return null;

  return (
    <div className="w-full h-full p-4 animate-fade-in">
      <MonolithicPanel className="w-full h-[600px] relative overflow-hidden bg-background/40 border-foreground/40 group">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--foreground)/0.18),hsl(var(--background)/0.95),hsl(var(--background)))] opacity-80"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url("https://www.transparenttextures.com/patterns/cartographer.png")',
          }}
        ></div>

        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Dynamic Pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="absolute flex flex-col items-center gap-2 group/pin cursor-pointer hover:scale-110 transition-transform"
            style={{
              top: pin.top,
              left: pin.left,
              bottom: pin.bottom,
              right: pin.right,
            }}
          >
            <span
              className={`material-symbols-outlined text-4xl text-${pin.color}-500 drop-shadow-[0_0_15px_rgba(var(--${pin.color}-rgb),0.5)]`}
            >
              {pin.type}
            </span>
            <span
              className={`text-[10px] uppercase font-black tracking-widest text-${pin.color}-100 bg-background/50 px-2 py-1 rounded-full border border-${pin.color}-500/30 opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap`}
            >
              {pin.label}
            </span>
          </div>
        ))}

        {/* UI Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={handleAddPin}
            className="p-2 rounded-none sunken-panel/80 border border-foreground/10 hover:bg-foreground/10 text-foreground transition-all shadow-xl"
          >
            <span className="material-symbols-outlined">add_location</span>
          </button>
          <button
            onClick={handleToggleLayers}
            className="p-2 rounded-none sunken-panel/80 border border-foreground/10 hover:bg-foreground/10 text-foreground transition-all shadow-xl"
          >
            <span className="material-symbols-outlined">layers</span>
          </button>
        </div>

        <div className="absolute bottom-4 right-4 text-xs font-mono text-foreground/30">
          COORD: 45.32, -12.04 | SCALE: 1:50000
        </div>
      </MonolithicPanel>
    </div>
  );
};

export default SpecializedMap;
