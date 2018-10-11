import * as React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from "react-native";
import { DayPicker } from "./DayPicker";

import { Color, Font } from "./constants";
import ArrivalTimes from "./constants/Mock";

const Button = ({ onPress, children, ...props }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} {...props}>
      <SafeAreaView style={Styles.ButtonRoot}>
        <View style={Styles.ButtonInner}>
          <Text style={Styles.ButtonLabel}>{children}</Text>
        </View>
      </SafeAreaView>
    </TouchableOpacity>
  );
};

class App extends React.Component {

  _selectArrivalTime = (selectedArrivalTime) => {
    console.log(selectedArrivalTime);
  }

  render() {
    return (
      <View style={Styles.Container}>
        <StatusBar barStyle="light-content" />
        <View style={Styles.Header}>
          <Text style={Styles.HeaderText}>
            Welcome to the React Native Lugg Exercise.
          </Text>
        </View>
        <View style={Styles.Body}>
          <DayPicker dates={ArrivalTimes} onSelect={this._selectArrivalTime}></DayPicker>
        </View>
        <View style={Styles.Footer}>
          <Button style={Styles.Button}>Next</Button>
        </View>
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: Color.primary
  },
  Header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  Footer: {},
  Body: {
    height: 248,
    alignItems: "center",
    justifyContent: "center"
  },
  HeaderText: {
    ...Font.regular,
    color: "#fff",
    textAlign: "center",
    maxWidth: 320
  },
  ButtonRoot: {
    backgroundColor: Color.action
  },
  ButtonInner: {
    height: 56,
    alignItems: "center",
    justifyContent: "center"
  },
  ButtonLabel: {
    ...Font.medium,
    color: Color.primary,
    fontSize: 18
  }
});

export default App;
