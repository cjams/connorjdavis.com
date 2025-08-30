import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { AxesHelper } from 'three';
import { useRef, useEffect } from 'react';
import type { ThreeCanvasProps } from '../../types/3d';

// Axes Helper Component
const AxesHelperComponent: React.FC<{ size?: number }> = ({ size = 5 }) => {
  const axesRef = useRef<AxesHelper>(null);
  
  useEffect(() => {
    if (axesRef.current) {
      // Ensure axes are visible and properly sized
      axesRef.current.setColors('#ff0000', '#00ff00', '#0000ff'); // Red=X, Green=Y, Blue=Z
    }
  }, []);

  return (
    <primitive object={new AxesHelper(size)} ref={axesRef} />
  );
};

// Axis Labels Component
const AxisLabels: React.FC = () => {
  return (
    <group>
      {/* X-axis label */}
      <Text
        position={[6, 0, 0]}
        fontSize={0.5}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      
      {/* Y-axis label */}
      <Text
        position={[0, 6, 0]}
        fontSize={0.5}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
      
      {/* Z-axis label */}
      <Text
        position={[0, 0, 6]}
        fontSize={0.5}
        color="#0000ff"
        anchorX="center"
        anchorY="middle"
      >
        Z = f(x,y)
      </Text>
    </group>
  );
};

/**
 * Three.js Canvas wrapper component with common setup
 */
export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  height = '400px',
  camera,
  children
}) => {
  const defaultCamera = {
    position: camera?.position || [6, 6, 20] as [number, number, number],
    target: camera?.target || [0, 0, 0] as [number, number, number],
    enableZoom: camera?.enableZoom ?? true,
    enablePan: camera?.enablePan ?? true,
    enableRotate: camera?.enableRotate ?? true
  };

  return (
    <div style={{ width: '100%', height }} className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{
          position: defaultCamera.position,
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />

        {/* XY-plane grid (horizontal plane where Z=0) */}
        <Grid
          args={[20, 20]}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
        
        {/* Axes helper to show X, Y, Z directions clearly */}
        <AxesHelperComponent size={6} />
        
        {/* Axis labels */}
        <AxisLabels />

        {/* Orbit controls */}
        <OrbitControls
          target={defaultCamera.target}
          enableZoom={defaultCamera.enableZoom}
          enablePan={defaultCamera.enablePan}
          enableRotate={defaultCamera.enableRotate}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={50}
          maxPolarAngle={Math.PI}
        />

        {/* Children (mesh components) */}
        {children}
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;
