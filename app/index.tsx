import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../src/store/authStore";

export default function Index() {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only route when navigation is fully mounted and ready
    if (!mounted) return;

    // Use a small timeout purely to let layout initialize
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/(auth)" as any);
        return;
      }

      if (role === "advocate") {
        router.replace("/(advocate)" as any);
      } else {
        router.replace("/(client)" as any);
      }
    }, 10);

    return () => clearTimeout(timeout);
  }, [mounted, isAuthenticated, role]);

  return null;
}
