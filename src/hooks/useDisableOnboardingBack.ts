import { useEffect } from "react";
import { BackHandler } from "react-native";

const useDisableOnboardingBack = () => {
  useEffect(() => {
    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => true,
      );

    return () => {
      subscription.remove();
    };
  }, []);
};

export default useDisableOnboardingBack;