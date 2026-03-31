import { createContext, useContext } from "react";
import { SharedValue } from "react-native-reanimated";

export type HeaderContextType = {
  exploreScrollY: SharedValue<number> | null;
  homeScrollY: SharedValue<number> | null;
  chatsScrollY: SharedValue<number> | null;
};

export const HeaderContext = createContext<HeaderContextType>({
  exploreScrollY: null,
  homeScrollY: null,
  chatsScrollY: null,
});

export const useHeaderContext = () => useContext(HeaderContext);
