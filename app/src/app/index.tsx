import { Text, View } from 'react-native';

export default function IndexScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-xl font-semibold">Init PRJ</Text>
      <Text className="mt-2 text-center text-gray-600">
        Bộ khung React Native đã sẵn sàng.
      </Text>
    </View>
  );
}
