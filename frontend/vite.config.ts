import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Include Three.js dependencies for pre-bundling
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'mathjs'
    ],
  },
  build: {
    // Optimize chunk splitting for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Bundle Three.js and related dependencies separately
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // Bundle math utilities separately
          'math-vendor': ['mathjs']
        }
      }
    },
    // Increase chunk size limit for 3D assets
    chunkSizeWarningLimit: 2000,
    // Enable source maps in development for debugging Three.js
    sourcemap: process.env.NODE_ENV === 'development'
  },
  // Configure asset handling for potential 3D assets
  assetsInclude: ['**/*.hdr', '**/*.exr', '**/*.gltf', '**/*.glb'],
  // Configure server for development
  server: {
    // Enable CORS for local development with 3D assets
    cors: true,
    // Optimize for faster HMR with large dependencies
    hmr: {
      overlay: false
    }
  }
});
