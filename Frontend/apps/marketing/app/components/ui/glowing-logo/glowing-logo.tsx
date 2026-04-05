"use client"

import {useRef, useState} from "react"
import {clx} from "@repo/ui/utilities";
import {Logo} from "@repo/ui/components/logo/logo";

interface GlowingLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function GlowingLogo({className, ...props}: GlowingLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Create state to hold the coordinates (defaults to center: 50%)
  const [mousePos, setMousePos] = useState({x: 50, y: 50});

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    // 2. Update state instead of CSS variables
    setMousePos({x: xPct, y: yPct});
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      className={clx(className)}
      {...props}
    >
      {/* 3. Pass the state down as props to your Logo component */}
      <Logo withGlow mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  )
}