import * as React from "react";
import {
    View,
    Text,
    PanResponder,
    Animated,
    StyleSheet
} from "react-native";
import moment from "moment";
import { Metrics, Color, Font } from "./constants";

export class TimePicker extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            position: new Animated.Value(0),
            offset: new Animated.Value(0),
            index: 0,
            height: 0,
        }

        this.numTimeSlots = this.props.timeSlots.length;
    }

    selectedIndex = () => {
        return this.state.index;
    }

    _generateTimeSlots = () => {
        return this.props.timeSlots.map((timeSlot, index) => {
            return (
                <View style={Styles.timeSlot} key={index}>
                    <Text style={[
                            Styles.timeSlotText,  
                            this.state.index === index && Styles.timeSlotTextSelected,
                            !timeSlot.available && Styles.timeSlotTextUnavailable]}>
                        {this._timeFormatted(this.props.date, timeSlot.startTime, timeSlot.endTime)}
                    </Text>
                </View>
            );
        });
    }

    _isMovingUp = (gestureState) => {
        return gestureState.vy > 0
    }

    _isMovingDown = (gestureState) => {
        return gestureState.vy < 0
    }

    _getTimePickerHeight = (event) => {
        this.setState({height: event.nativeEvent.layout.height});
    }

    _startPositionForIndex = (index) => {
        return Metrics.timeSlotHeight * -index;
    }

    _indexForPosition = (position) => {
        return Math.round(Math.abs(position/Metrics.timeSlotHeight));
    }

    _timeFormatted = (date, startTime, endTime) => {
        let dateTimeFormat = `${Metrics.dateFormat} ${Metrics.timeFormat}`;
        let nowDateTime = moment().format(dateTimeFormat);
        let hoursFromNow = moment(moment(`${date} ${endTime}`, dateTimeFormat)).diff(moment(nowDateTime, dateTimeFormat), 'hours');

        return !hoursFromNow ? "Within the hour" : `${startTime} - ${endTime}`;
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: (event, gestureState) => {
                // Return true if the movement is mostly vertical
                return (
                    Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 3) &&
                    Math.abs(gestureState.vy) > Math.abs(gestureState.vx * 3)
                );
            },

            onPanResponderGrant: () => {
                this.state.offset.setValue(this.state.position._value);
            },

            onPanResponderMove: (event, gestureState) => {
                const isMovingDown = this._isMovingDown(gestureState);
                const isMovingUp = this._isMovingUp(gestureState);
                const isFirstTimeSlot = this.state.index === 0;
                const isLastTimeSlot = this.state.index === this.numTimeSlots - 1;

                if((isMovingDown && !isLastTimeSlot) || (isMovingUp && !isFirstTimeSlot)) {
                    const newPosition = gestureState.dy + this.state.offset._value;
                    this.state.position.setValue(newPosition);
    
                    const activeTimeSlot = this._indexForPosition(newPosition);
                    this.setState({index: activeTimeSlot});
                }

            },

            onPanResponderRelease: () => {
                const nearestTimeSlotStartPosition = this._startPositionForIndex(this.state.index);
                Animated.spring(this.state.position, {
                    toValue: nearestTimeSlotStartPosition
                }).start();      
                this.props.onSelect(this.state.index);      
            }

        });
    }

    render() {
        let transform = {
            transform: [{translateY: this.state.position}]
        }
        return (
            <View style={Styles.timePicker} onLayout={this._getTimePickerHeight}>
                <View style={[
                        Styles.selectedBar, 
                        !this.props.timeSlots[this.state.index].available && Styles.selectedBarUnavailable]}></View>
                <Animated.View style={[Styles.timeSlotsContainer, transform]} {...this._panResponder.panHandlers}>
                    {this._generateTimeSlots()}
                </Animated.View>
            </View>
        );
    };
}

const Styles = StyleSheet.create({
  timePicker: {
    flex: 1,
    flexBasis: Metrics.screenWidth,
    overflow: "hidden",
    paddingTop: Metrics.timeSlotHeight,
  },
  timeSlotsContainer: {
    flexDirection: "column",
  },
  timeSlot: {
    flex: 1,
    flexBasis: Metrics.timeSlotHeight,
    justifyContent: "center",
  },
  timeSlotText: {
      ...Font["medium"],
      fontSize: 16,
      color: Color.primaryLightest,
      textAlign: "center",
  },
  timeSlotTextSelected: {
      color: Color.primaryDarker,
  },
  timeSlotTextUnavailable: {
      color: Color.primaryLight,
  },
  selectedBar: {
    position: "absolute",
    top: Metrics.timeSlotHeight,
    left: 0,
    right: 0,
    width: "100%",
    height: Metrics.timeSlotHeight,
    backgroundColor: Color.action,
  },
  selectedBarUnavailable: {
      backgroundColor: Color.primaryDark,
  }
});