import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

export function useColors() {
  const { theme } = useTheme();
  const palette = theme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
