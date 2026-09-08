import React from "react";
import { StyleSheet, View } from "react-native";

import FontText from "../../components/common/FontText";
import { colors } from "../../constant/colors";

const ResultScreen = () => {
  return (
    <View style={styles.container}>
      <FontText variant="heading2">
        Result Screen
      </FontText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});

export default ResultScreen;