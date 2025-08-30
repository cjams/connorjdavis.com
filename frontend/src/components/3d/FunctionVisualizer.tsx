import React, { useMemo, useState } from 'react';
import { parseMathExpression } from '../../utils/mathParser';
import ThreeCanvas from './ThreeCanvas';
import FunctionMesh from './FunctionMesh';
import { ColorLegend } from './ColorGradient';
import type { FunctionVisualizerProps } from '../../types/3d';

/**
 * Main component for visualizing mathematical functions as interactive 3D surfaces
 */
export const FunctionVisualizer: React.FC<FunctionVisualizerProps> = ({
  function: functionExpression,
  domain = { x: [-5, 5], y: [-5, 5] },
  resolution = 50,
  showWireframe = false,
  colorScheme = 'viridis',
  height = '400px',
  cameraPosition = [5, 5, 5],
  enableControls = true
}) => {
  const [error, setError] = useState<string | null>(null);

  // Parse the mathematical expression
  const mathFunction = useMemo(() => {
    const result = parseMathExpression(functionExpression);
    
    if (!result.success) {
      setError(result.error || 'Failed to parse mathematical expression');
      return null;
    }
    
    setError(null);
    return result.function!;
  }, [functionExpression]);

  // Calculate bounds for color legend
  const bounds = useMemo(() => {
    if (!mathFunction) return { min: 0, max: 1 };
    
    // Sample function over domain to get rough bounds
    const sampleCount = 20;
    let minZ = Infinity;
    let maxZ = -Infinity;
    
    for (let i = 0; i <= sampleCount; i++) {
      for (let j = 0; j <= sampleCount; j++) {
        const x = domain.x[0] + (i / sampleCount) * (domain.x[1] - domain.x[0]);
        const y = domain.y[0] + (j / sampleCount) * (domain.y[1] - domain.y[0]);
        const z = mathFunction.evaluate(x, y);
        
        if (isFinite(z)) {
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        }
      }
    }
    
    return { min: minZ, max: maxZ };
  }, [mathFunction, domain]);

  // Error state
  if (error) {
    return (
      <div 
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 font-medium mb-2">
              Error: Unable to render function
            </div>
            <div className="text-red-500 dark:text-red-300 text-sm">
              {error}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Function: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {functionExpression}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (shouldn't happen with synchronous parsing, but good for future async features)
  if (!mathFunction) {
    return (
      <div 
        className="bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500 dark:text-gray-400">
          Loading function visualization...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Function info header */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div>
          Function: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
            f(x,y) = {functionExpression}
          </code>
        </div>
        <div>
          Domain: x ∈ [{domain.x[0]}, {domain.x[1]}], y ∈ [{domain.y[0]}, {domain.y[1]}]
        </div>
      </div>

      {/* 3D Visualization */}
      <ThreeCanvas
        height={height}
        camera={{
          position: cameraPosition,
          target: [0, 0, 0],
          enableZoom: enableControls,
          enablePan: enableControls,
          enableRotate: enableControls
        }}
      >
        <FunctionMesh
          mathFunction={mathFunction}
          domain={domain}
          resolution={resolution}
          colorScheme={colorScheme}
          showWireframe={showWireframe}
        />
      </ThreeCanvas>

      {/* Color Legend */}
      <div className="flex justify-center">
        <ColorLegend
          colorScheme={colorScheme}
          min={bounds.min}
          max={bounds.max}
          className="mt-2"
        />
      </div>

      {/* Controls info */}
      {enableControls && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          🖱️ Click and drag to rotate • Scroll to zoom • Right-click and drag to pan
        </div>
      )}
    </div>
  );
};

export default FunctionVisualizer;
