import { useMediaQuery } from "react-responsive";

export function useIsDesktop() {
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  return isDesktop;
}

export function useIsTablet() {
  const isDesktop = useMediaQuery({ query: "(min-width: 640px)" });
  return isDesktop;
}
