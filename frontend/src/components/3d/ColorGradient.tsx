import type { ColorScheme, ColorGradientProps } from '../../types/3d';

/**
 * Color scheme definitions mapping normalized values (0-1) to RGB colors
 */
const COLOR_SCHEMES: Record<ColorScheme, Array<[number, number, number]>> = {
  viridis: [
    [0.267004, 0.004874, 0.329415], // Dark purple
    [0.229739, 0.322361, 0.545706], // Blue
    [0.127568, 0.566949, 0.550556], // Teal
    [0.369214, 0.788888, 0.382914], // Green
    [0.993248, 0.906157, 0.143936]  // Yellow
  ],
  plasma: [
    [0.050383, 0.029803, 0.527975], // Dark blue
    [0.513094, 0.038756, 0.627828], // Purple
    [0.759419, 0.334393, 0.531137], // Pink
    [0.966006, 0.620657, 0.262835], // Orange
    [0.940015, 0.975158, 0.131326]  // Yellow
  ],
  cool: [
    [0.0, 1.0, 1.0], // Cyan
    [0.0, 0.5, 1.0], // Light blue
    [0.0, 0.0, 1.0], // Blue
    [0.5, 0.0, 1.0], // Purple
    [1.0, 0.0, 1.0]  // Magenta
  ],
  warm: [
    [1.0, 0.0, 0.0], // Red
    [1.0, 0.5, 0.0], // Orange
    [1.0, 1.0, 0.0], // Yellow
    [1.0, 1.0, 0.5], // Light yellow
    [1.0, 1.0, 1.0]  // White
  ]
};

/**
 * Interpolate between two colors
 */
function interpolateColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    color1[0] + t * (color2[0] - color1[0]),
    color1[1] + t * (color2[1] - color1[1]),
    color1[2] + t * (color2[2] - color1[2])
  ];
}

/**
 * Map a normalized value (0-1) to a color using the specified color scheme
 */
export function getColorForValue(value: number, colorScheme: ColorScheme): [number, number, number] {
  const colors = COLOR_SCHEMES[colorScheme];
  
  // Handle NaN, undefined, or invalid values
  if (!isFinite(value)) {
    return [0, 0, 0]; // Return black for invalid values
  }
  
  // Clamp value to [0, 1]
  const normalizedValue = Math.max(0, Math.min(1, value));
  
  if (normalizedValue === 0) {
    return colors[0];
  }
  
  if (normalizedValue === 1) {
    return colors[colors.length - 1];
  }
  
  // Find the two colors to interpolate between
  const scaledValue = normalizedValue * (colors.length - 1);
  const lowerIndex = Math.floor(scaledValue);
  const upperIndex = Math.ceil(scaledValue);
  
  // Ensure indices are within bounds
  const safeLowerIndex = Math.max(0, Math.min(colors.length - 1, lowerIndex));
  const safeUpperIndex = Math.max(0, Math.min(colors.length - 1, upperIndex));
  
  if (safeLowerIndex === safeUpperIndex) {
    return colors[safeLowerIndex];
  }
  
  const t = scaledValue - lowerIndex;
  return interpolateColor(colors[safeLowerIndex], colors[safeUpperIndex], t);
}

/**
 * Create color array for function mesh based on z-values
 */
export function createColorGradient({ values, colorScheme, min, max }: ColorGradientProps): Float32Array {
  // Filter out NaN values for min/max calculation
  const finiteValues = values.filter(v => isFinite(v));
  
  // If no finite values, return default colors
  if (finiteValues.length === 0) {
    const colors: number[] = [];
    for (let i = 0; i < values.length; i++) {
      colors.push(0, 0, 0); // Black for NaN values
    }
    return new Float32Array(colors);
  }
  
  // Calculate min and max from finite values only
  const minValue = min !== undefined ? min : Math.min(...finiteValues);
  const maxValue = max !== undefined ? max : Math.max(...finiteValues);
  const range = maxValue - minValue;
  
  const colors: number[] = [];
  
  for (const value of values) {
    if (!isFinite(value)) {
      // Use black color for NaN/infinite values
      colors.push(0, 0, 0);
    } else {
      // Normalize value to [0, 1]
      const normalizedValue = range > 0 ? (value - minValue) / range : 0;
      
      // Get color for this value
      const [r, g, b] = getColorForValue(normalizedValue, colorScheme);
      
      colors.push(r, g, b);
    }
  }
  
  return new Float32Array(colors);
}

/**
 * Generate a color legend/scale for the gradient
 */
export function generateColorLegend(
  colorScheme: ColorScheme,
  steps: number = 256
): Array<{ value: number; color: string }> {
  const legend: Array<{ value: number; color: string }> = [];
  
  for (let i = 0; i < steps; i++) {
    const normalizedValue = i / (steps - 1);
    const [r, g, b] = getColorForValue(normalizedValue, colorScheme);
    
    // Convert to hex color
    const hex = '#' + [r, g, b]
      .map(c => Math.round(c * 255).toString(16).padStart(2, '0'))
      .join('');
    
    legend.push({
      value: normalizedValue,
      color: hex
    });
  }
  
  return legend;
}

/**
 * Get the color scheme name for display
 */
export function getColorSchemeName(scheme: ColorScheme): string {
  const names: Record<ColorScheme, string> = {
    viridis: 'Viridis',
    plasma: 'Plasma',
    cool: 'Cool',
    warm: 'Warm'
  };
  
  return names[scheme];
}

/**
 * React component for displaying a color gradient legend
 */
export const ColorLegend: React.FC<{
  colorScheme: ColorScheme;
  min: number;
  max: number;
  className?: string;
}> = ({ colorScheme, min, max, className = '' }) => {
  const legend = generateColorLegend(colorScheme, 50);
  
  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {getColorSchemeName(colorScheme)}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {min.toFixed(2)}
        </span>
        <div className="w-32 h-4 rounded-full overflow-hidden flex">
          {legend.map((item, index) => (
            <div
              key={index}
              className="flex-1"
              style={{ backgroundColor: item.color }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {max.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ColorLegend;
