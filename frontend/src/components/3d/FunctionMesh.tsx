import React, { useMemo } from 'react';
import { BufferGeometry, BufferAttribute } from 'three';
import { generateFunctionMesh, calculateNormals, generateWireframeIndices } from '../../utils/meshGenerator';
import { createColorGradient } from './ColorGradient';
import type { FunctionMeshProps } from '../../types/3d';

/**
 * Three.js mesh component for rendering mathematical functions as 3D surfaces
 */
export const FunctionMesh: React.FC<FunctionMeshProps> = ({
  mathFunction,
  domain,
  resolution,
  colorScheme,
  showWireframe = false
}) => {
  // Generate mesh data - memoized for performance
  const meshData = useMemo(() => {
    return generateFunctionMesh(mathFunction, domain, resolution);
  }, [mathFunction, domain, resolution]);

  // Generate colors using the color gradient utility
  const colors = useMemo(() => {
    // Extract z-values from vertices
    const zValues: number[] = [];
    for (let i = 2; i < meshData.vertices.length; i += 3) {
      zValues.push(meshData.vertices[i]);
    }
    
    return createColorGradient({
      values: zValues,
      colorScheme,
      min: meshData.bounds.min.z,
      max: meshData.bounds.max.z
    });
  }, [meshData, colorScheme]);

  // Calculate surface normals for proper lighting
  const normals = useMemo(() => {
    return calculateNormals(meshData.vertices, meshData.indices);
  }, [meshData.vertices, meshData.indices]);

  // Generate wireframe indices if wireframe is enabled
  const wireframeIndices = useMemo(() => {
    return showWireframe ? generateWireframeIndices(resolution) : null;
  }, [showWireframe, resolution]);

  // Create the BufferGeometry
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    
    // Set attributes
    geo.setAttribute('position', new BufferAttribute(meshData.vertices, 3));
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.setAttribute('normal', new BufferAttribute(normals, 3));
    geo.setIndex(new BufferAttribute(meshData.indices, 1));
    
    return geo;
  }, [meshData.vertices, meshData.indices, colors, normals]);

  // Create wireframe geometry if needed
  const wireframeGeometry = useMemo(() => {
    if (!wireframeIndices) return null;
    
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(meshData.vertices, 3));
    geo.setIndex(new BufferAttribute(wireframeIndices, 1));
    
    return geo;
  }, [meshData.vertices, wireframeIndices]);

  return (
    <group>
      {/* Main surface mesh */}
      <mesh geometry={geometry}>
        <meshLambertMaterial
          vertexColors={true}
          side={2} // DoubleSide
          transparent={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      {showWireframe && wireframeGeometry && (
        <lineSegments geometry={wireframeGeometry}>
          <lineBasicMaterial
            color="#333333"
            transparent={true}
            opacity={0.3}
            linewidth={1}
          />
        </lineSegments>
      )}
    </group>
  );
};

export default FunctionMesh;
