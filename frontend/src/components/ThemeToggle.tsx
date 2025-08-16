import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else if (theme === "system") {
      setTheme("ocean");
    } else if (theme === "ocean") {
      setTheme("forest");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      case "system":
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (theme) {
      case "light":
        return "Switch to dark theme";
      case "dark":
        return "Switch to system theme";
      case "system":
        return "Switch to ocean theme";
      case "ocean":
        return "Switch to forest theme";
      case "forest":
        return "Switch to light theme";
      default:
        return "Toggle theme";
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleThemeChange}
      title={getTitle()}
      className="h-9 w-9"
    >
      {getIcon()}
      <span className="sr-only">{getTitle()}</span>
    </Button>
  );
};
