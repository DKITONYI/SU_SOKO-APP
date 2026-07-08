import { useNavigation } from "@react-navigation/native";

export const useBackNavigation = <FallbackRoute extends string>(
  fallbackRoute: FallbackRoute
) => {
  const navigation = useNavigation<any>();

  return () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(fallbackRoute);
  };
};
