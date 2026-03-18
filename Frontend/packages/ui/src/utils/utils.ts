// packages/ui/src/utils.ts
import {type ClassValue, clsx} from "clsx";

// Export it so your apps can use it
export function clx(...inputs: ClassValue[]) {
  return clsx(inputs);
}