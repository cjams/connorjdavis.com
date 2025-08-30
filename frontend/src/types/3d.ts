// Core function visualization types
export interface FunctionVisualizerProps {
  function: string;                    // Mathematical expression like "x*2 + y*2"
  domain?: {                          // Function domain bounds
    x: [number, number];
    y: [number, number];
  };
  resolution?: number;                 // Mesh resolution (default: 50)
  showWireframe?: boolean;            // Toggle wireframe overlay
  colorScheme?: 'viridis' | 'plasma' | 'cool' | 'warm';
  height?: string;                    // Component height (default: "400px")
  cameraPosition?: [number, number, number];
  enableControls?: boolean;           // Enable orbit controls (default: true)
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FunctionMesh {
  vertices: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
  bounds: {
    min: Point3D;
    max: Point3D;
  };
}

export interface MathFunction {
  expression: string;
  evaluate: (x: number, y: number) => number;
  gradient?: (x: number, y: number) => [number, number];
}

// Extension types for future features
export interface GradientVisualizationProps extends FunctionVisualizerProps {
  showGradientAt?: Point3D;           // Show gradient vector at point
  gradientScale?: number;             // Scale factor for gradient arrows
}

export interface PointTracker {
  position: Point3D;
  color?: string;
  size?: number;
  animated?: boolean;
}

// Domain bounds type
export interface Domain {
  x: [number, number];
  y: [number, number];
}

// Color scheme definitions
export type ColorScheme = 'viridis' | 'plasma' | 'cool' | 'warm';

// Three.js mesh generation types
export interface MeshGenerationOptions {
  resolution: number;
  domain: Domain;
  wireframe?: boolean;
}

// Camera control types
export interface CameraControls {
  position: [number, number, number];
  target: [number, number, number];
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
}

// Color gradient types
export interface ColorGradientProps {
  values: number[];
  colorScheme: ColorScheme;
  min?: number;
  max?: number;
}

// Three Canvas props
export interface ThreeCanvasProps {
  height?: string;
  camera?: CameraControls;
  children: React.ReactNode;
}

// Function mesh component props
export interface FunctionMeshProps {
  mathFunction: MathFunction;
  domain: Domain;
  resolution: number;
  colorScheme: ColorScheme;
  showWireframe?: boolean;
}

// Validation and error types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface MathParsingResult {
  success: boolean;
  function?: MathFunction;
  error?: string;
}
