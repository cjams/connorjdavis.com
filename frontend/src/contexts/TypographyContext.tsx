import React, { createContext, useContext, useState, useEffect } from "react";
import type { TypographyConfig } from "../utils/content";

interface TypographyContextType {
  config: TypographyConfig;
  updateConfig: (newConfig: Partial<TypographyConfig>) => void;
  resetConfig: () => void;
  presets: Record<string, TypographyConfig>;
}

const defaultConfig: TypographyConfig = {
  className: "prose prose-lg max-w-none",
  maxWidth: "none",
  colorScheme: "auto",
};

const presetConfigs: Record<string, TypographyConfig> = {
  compact: {
    className: "prose prose-sm max-w-none",
    maxWidth: "none",
    colorScheme: "auto",
  },
  comfortable: {
    className: "prose prose-lg max-w-none",
    maxWidth: "none",
    colorScheme: "auto",
  },
  spacious: {
    className: "prose prose-xl max-w-none",
    maxWidth: "none",
    colorScheme: "auto",
  },
  reading: {
    className: "prose prose-lg max-w-4xl mx-auto",
    maxWidth: "4xl",
    colorScheme: "auto",
  },
};

const TypographyContext = createContext<TypographyContextType | undefined>(
  undefined
);

interface TypographyProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<TypographyConfig>;
}

export const TypographyProvider: React.FC<TypographyProviderProps> = ({
  children,
  initialConfig,
}) => {
  const [config, setConfig] = useState<TypographyConfig>(() => {
    // Try to load config from localStorage
    const savedConfig = localStorage.getItem("typography-config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        return { ...defaultConfig, ...parsed, ...initialConfig };
      } catch {
        // If parsing fails, use default
      }
    }
    return { ...defaultConfig, ...initialConfig };
  });

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("typography-config", JSON.stringify(config));
  }, [config]);

  // Listen for system theme changes when colorScheme is 'auto'
  useEffect(() => {
    if (config.colorScheme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Force re-render by updating config
      setConfig((prev) => ({ ...prev }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [config.colorScheme]);

  const updateConfig = (newConfig: Partial<TypographyConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem("typography-config");
  };

  const contextValue: TypographyContextType = {
    config,
    updateConfig,
    resetConfig,
    presets: presetConfigs,
  };

  return (
    <TypographyContext.Provider value={contextValue}>
      {children}
    </TypographyContext.Provider>
  );
};

export const useTypography = (): TypographyContextType => {
  const context = useContext(TypographyContext);
  if (context === undefined) {
    throw new Error("useTypography must be used within a TypographyProvider");
  }
  return context;
};

// Hook for getting responsive typography classes
export const useResponsiveTypography = (
  baseConfig?: Partial<TypographyConfig>
): string => {
  const { config } = useTypography();
  const finalConfig = { ...config, ...baseConfig };

  let classes = finalConfig.className || "";

  // Add responsive variations
  if (classes.includes("prose-sm")) {
    classes += " sm:prose md:prose-lg";
  } else if (classes.includes("prose-lg")) {
    classes += " sm:prose-sm md:prose-lg lg:prose-xl";
  } else if (classes.includes("prose-xl")) {
    classes += " sm:prose md:prose-lg lg:prose-xl";
  }

  // Add color scheme classes based on current theme
  if (finalConfig.colorScheme === "dark") {
    classes += " prose-invert";
  } else if (finalConfig.colorScheme === "auto") {
    // Check system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      classes += " prose-invert";
    }
  }

  return classes;
};

// Hook for typography settings panel
export const useTypographySettings = () => {
  const { config, updateConfig, resetConfig, presets } = useTypography();

  const applyPreset = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      updateConfig(preset);
    }
  };

  const toggleColorScheme = () => {
    const schemes: Array<TypographyConfig["colorScheme"]> = [
      "auto",
      "light",
      "dark",
    ];
    const currentIndex = schemes.indexOf(config.colorScheme || "auto");
    const nextIndex = (currentIndex + 1) % schemes.length;
    updateConfig({ colorScheme: schemes[nextIndex] });
  };

  const setSize = (size: "sm" | "base" | "lg" | "xl") => {
    const sizeClasses = {
      sm: "prose prose-sm max-w-none",
      base: "prose max-w-none",
      lg: "prose prose-lg max-w-none",
      xl: "prose prose-xl max-w-none",
    };

    updateConfig({ className: sizeClasses[size] });
  };

  return {
    config,
    updateConfig,
    resetConfig,
    applyPreset,
    toggleColorScheme,
    setSize,
    presets,
  };
};

export default TypographyContext;
