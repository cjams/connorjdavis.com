import type { MathFunction, FunctionMesh, Domain, Point3D } from '../types/3d';

/**
 * Clamp Z-values to specified range
 */
export function clampZValue(z: number, zRange: [number, number]): number {
  return Math.max(zRange[0], Math.min(zRange[1], z));
}

/**
 * Generate a 3D mesh from a mathematical function f(x,y) = z
 */
export function generateFunctionMesh(
  mathFunction: MathFunction,
  domain: Domain,
  resolution: number,
  zRange?: [number, number]
): FunctionMesh {
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  
  let actualMinZ = Infinity;
  let actualMaxZ = -Infinity;
  let clampedMinZ = Infinity;
  let clampedMaxZ = -Infinity;
  
  // Generate all vertices with proper z-clamping
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const x = domain.x[0] + (i / resolution) * (domain.x[1] - domain.x[0]);
      const y = domain.y[0] + (j / resolution) * (domain.y[1] - domain.y[0]);
      const originalZ = mathFunction.evaluate(x, y);
      
      // Skip completely invalid points (NaN, Infinity)
      if (!isFinite(originalZ)) {
        // Use a reasonable fallback for non-finite values
        vertices.push(x, y, 0);
        continue;
      }
      
      // Track actual bounds (before clamping)
      actualMinZ = Math.min(actualMinZ, originalZ);
      actualMaxZ = Math.max(actualMaxZ, originalZ);
      
      // Apply z-range clamping if specified
      let finalZ = originalZ;
      if (zRange) {
        finalZ = Math.max(zRange[0], Math.min(zRange[1], originalZ));
      }
      
      // Track clamped bounds
      clampedMinZ = Math.min(clampedMinZ, finalZ);
      clampedMaxZ = Math.max(clampedMaxZ, finalZ);
      
      vertices.push(x, y, finalZ);
    }
  }
  
  // Generate colors for all vertices (back to RGB without alpha)
  const numVertices = vertices.length / 3;
  for (let k = 0; k < numVertices; k++) {
    const z = vertices[k * 3 + 2];
    const normalizedZ = clampedMaxZ > clampedMinZ ? (z - clampedMinZ) / (clampedMaxZ - clampedMinZ) : 0;
    
    // Simple color gradient from blue (low) to red (high)
    const r = normalizedZ;
    const g = 0.5;
    const b = 1 - normalizedZ;
    
    colors.push(r, g, b);
  }
  
  // Generate triangle indices - exclude triangles that are on flat planes at z-limits
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const topLeft = i * (resolution + 1) + j;
      const topRight = topLeft + 1;
      const bottomLeft = (i + 1) * (resolution + 1) + j;
      const bottomRight = bottomLeft + 1;
      
      // Check that all vertices have finite z-values
      const topLeftZ = vertices[topLeft * 3 + 2];
      const topRightZ = vertices[topRight * 3 + 2];
      const bottomLeftZ = vertices[bottomLeft * 3 + 2];
      const bottomRightZ = vertices[bottomRight * 3 + 2];
      
      if (isFinite(topLeftZ) && isFinite(topRightZ) && isFinite(bottomLeftZ) && isFinite(bottomRightZ)) {
        // Skip triangles where all vertices are at the z-limit (creating flat planes)
        if (zRange && clampedMaxZ > clampedMinZ) {
          const tolerance = 0.001;
          const isAtLimit = (z: number) => Math.abs(z - zRange[1]) < tolerance || Math.abs(z - zRange[0]) < tolerance;
          
          const allAtUpperLimit = isAtLimit(topLeftZ) && isAtLimit(topRightZ) && 
                                 isAtLimit(bottomLeftZ) && isAtLimit(bottomRightZ) &&
                                 Math.abs(topLeftZ - zRange[1]) < tolerance;
          
          if (!allAtUpperLimit) {
            // First triangle
            indices.push(topLeft, bottomLeft, topRight);
            
            // Second triangle  
            indices.push(topRight, bottomLeft, bottomRight);
          }
        } else {
          // No z-range filtering, include all valid triangles
          indices.push(topLeft, bottomLeft, topRight);
          indices.push(topRight, bottomLeft, bottomRight);
        }
      }
    }
  }
  
  return {
    vertices: new Float32Array(vertices),
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
    bounds: {
      min: {
        x: domain.x[0],
        y: domain.y[0],
        z: isFinite(clampedMinZ) ? clampedMinZ : 0
      },
      max: {
        x: domain.x[1],
        y: domain.y[1],
        z: isFinite(clampedMaxZ) ? clampedMaxZ : 0
      }
    },
    actualBounds: {
      min: {
        x: domain.x[0],
        y: domain.y[0],
        z: isFinite(actualMinZ) ? actualMinZ : 0
      },
      max: {
        x: domain.x[1],
        y: domain.y[1],
        z: isFinite(actualMaxZ) ? actualMaxZ : 0
      }
    },
    clampedBounds: {
      min: {
        x: domain.x[0],
        y: domain.y[0],
        z: isFinite(clampedMinZ) ? clampedMinZ : 0
      },
      max: {
        x: domain.x[1],
        y: domain.y[1],
        z: isFinite(clampedMaxZ) ? clampedMaxZ : 0
      }
    }
  };
}

/**
 * Calculate surface normals for proper lighting
 */
export function calculateNormals(vertices: Float32Array, indices: Uint32Array): Float32Array {
  const normals = new Float32Array(vertices.length);
  
  // Initialize all normals to zero
  for (let i = 0; i < normals.length; i++) {
    normals[i] = 0;
  }
  
  // Calculate face normals and accumulate vertex normals
  for (let i = 0; i < indices.length; i += 3) {
    const i1 = indices[i] * 3;
    const i2 = indices[i + 1] * 3;
    const i3 = indices[i + 2] * 3;
    
    // Get vertices
    const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
    const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];
    const v3 = [vertices[i3], vertices[i3 + 1], vertices[i3 + 2]];
    
    // Calculate face normal using cross product
    const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    
    const normal = [
      edge1[1] * edge2[2] - edge1[2] * edge2[1],
      edge1[2] * edge2[0] - edge1[0] * edge2[2],
      edge1[0] * edge2[1] - edge1[1] * edge2[0]
    ];
    
    // Normalize the face normal
    const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
    if (length > 0) {
      normal[0] /= length;
      normal[1] /= length;
      normal[2] /= length;
    }
    
    // Accumulate normal for each vertex of the face
    for (const vertexIndex of [i1, i2, i3]) {
      normals[vertexIndex] += normal[0];
      normals[vertexIndex + 1] += normal[1];
      normals[vertexIndex + 2] += normal[2];
    }
  }
  
  // Normalize accumulated vertex normals
  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.sqrt(
      normals[i] * normals[i] + 
      normals[i + 1] * normals[i + 1] + 
      normals[i + 2] * normals[i + 2]
    );
    
    if (length > 0) {
      normals[i] /= length;
      normals[i + 1] /= length;
      normals[i + 2] /= length;
    }
  }
  
  return normals;
}

/**
 * Generate wireframe indices for edge visualization
 */
export function generateWireframeIndices(resolution: number): Uint32Array {
  const wireframeIndices: number[] = [];
  
  // Horizontal lines
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const current = i * (resolution + 1) + j;
      const next = current + 1;
      wireframeIndices.push(current, next);
    }
  }
  
  // Vertical lines
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const current = i * (resolution + 1) + j;
      const below = (i + 1) * (resolution + 1) + j;
      wireframeIndices.push(current, below);
    }
  }
  
  return new Uint32Array(wireframeIndices);
}

/**
 * Optimize mesh for better performance by reducing vertices for flat areas
 */
export function optimizeMesh(mesh: FunctionMesh, tolerance: number = 0.01): FunctionMesh {
  // For now, return the original mesh
  // This could be enhanced with LOD (Level of Detail) algorithms
  return mesh;
}

/**
 * Calculate bounding box for a set of vertices
 */
export function calculateBoundingBox(vertices: Float32Array): { min: Point3D; max: Point3D } {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (let i = 0; i < vertices.length; i += 3) {
    minX = Math.min(minX, vertices[i]);
    maxX = Math.max(maxX, vertices[i]);
    
    minY = Math.min(minY, vertices[i + 1]);
    maxY = Math.max(maxY, vertices[i + 1]);
    
    minZ = Math.min(minZ, vertices[i + 2]);
    maxZ = Math.max(maxZ, vertices[i + 2]);
  }
  
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}
