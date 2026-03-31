import { AdvocateCard } from "@/components/ui/AdvocateCard";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { View } from "react-native";
import { useAdvocateStore } from "../store/useAdvocateStore";

interface AdvocateListProps {
  scrollEnabled?: boolean;
}

export function AdvocateList({ scrollEnabled = true }: AdvocateListProps) {
  const { advocates, filter } = useAdvocateStore();
  const router = useRouter();

  const filteredAdvocates = useMemo(() => {
    if (filter === "All") return advocates;
    return advocates.filter((adv) => adv.specialty.includes(filter));
  }, [advocates, filter]);

  return (
    <View className="flex-1 min-h-[2px] w-full">
      <FlashList
        data={filteredAdvocates}
        renderItem={({ item, index }) => (
          <AdvocateCard
            {...item}
            index={index}
            className="mb-4 mx-4"
            onPress={() => router.push(`/advocate/${item.id}` as any)}
          />
        )}
        // @ts-ignore
        estimatedItemSize={120}
        contentContainerStyle={{ paddingVertical: 16 }}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
