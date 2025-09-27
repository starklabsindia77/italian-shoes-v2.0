// react-three-fiber.d.ts
import type { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    // Augment the JSX namespace with all @react-three/fiber elements
    interface IntrinsicElements extends ThreeElements {}
  }
}

export {};
