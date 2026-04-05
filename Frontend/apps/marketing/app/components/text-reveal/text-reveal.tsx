"use client"

import {useRef} from "react";
import {motion, MotionValue, useScroll, useSpring, useTransform} from "framer-motion";
import {clx} from "@repo/ui/utilities";

interface TextRevealProps {
  text: string;
  className?: string;
}

export const TextReveal = ({text, className}: TextRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {scrollYProgress} = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 50%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 96,
    damping: 24,
  });

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={clx("flex", "flex-wrap", "gx-3", className)}>
      {words.map((word, index) => {
        const start = index / words.length;
        const end = start + (2 / words.length);

        return (
          <Word
            key={index}
            progress={smoothProgress}
            range={[start, end]}
          >
            {word}
          </Word>
        );
      })}
    </div>
  );
}

interface WordProps {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({children, progress, range}: WordProps) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <motion.span style={{opacity}}>
      {children}
    </motion.span>
  )
}