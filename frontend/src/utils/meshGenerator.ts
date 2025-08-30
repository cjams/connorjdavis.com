import type { MathFunction, FunctionMesh, Domain, Point3D } from '../types/3d';

/**
 * Generate a 3D mesh from a mathematical function f(x,y) = z
 */
export function generateFunctionMesh(
  mathFunction: MathFunction,
  domain: Domain,
  resolution: number
): FunctionMesh {
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  
  let minZ = Infinity;
  let maxZ = -Infinity;
  
  // Generate vertices and collect z-values for color mapping
  const zValues: number[] = [];
  
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const x = domain.x[0] + (i / resolution) * (domain.x[1] - domain.x[0]);
      const y = domain.y[0] + (j / resolution) * (domain.y[1] - domain.y[0]);
      const z = mathFunction.evaluate(x, y);
      
      vertices.push(x, y, z);
      zValues.push(z);
      
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
  }
  
  // Generate colors based on z-values (will be replaced by color gradient utility)
  for (const z of zValues) {
    const normalizedZ = maxZ > minZ ? (z - minZ) / (maxZ - minZ) : 0;
    
    // Simple color gradient from blue (low) to red (high)
    const r = normalizedZ;
    const g = 0.5;
    const b = 1 - normalizedZ;
    
    colors.push(r, g, b);
  }
  
  // Generate triangle indices
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const topLeft = i * (resolution + 1) + j;
      const topRight = topLeft + 1;
      const bottomLeft = (i + 1) * (resolution + 1) + j;
      const bottomRight = bottomLeft + 1;
      
      // First triangle
      indices.push(topLeft, bottomLeft, topRight);
      
      // Second triangle  
      indices.push(topRight, bottomLeft, bottomRight);
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
        z: minZ
      },
      max: {
        x: domain.x[1],
        y: domain.y[1],
        z: maxZ
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
