import * as React from "react";
import {
    View,
    Text,
    Animated,
    PanResponder,
    StyleSheet
} from "react-native";
import moment from "moment";
import { Metrics, Color, Font } from "./constants";
import { TimePicker } from "./TimePicker";

export class DayPicker extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      position: new Animated.Value(0),
      offset: new Animated.Value(0),    
      dayIndex: 0,
      timeIndex: 0,
    };

    this.width = Metrics.screenWidth,
    this.numDays = this.props.dates.length;
    this.timePickers = [];
  }

  _generateDays = () => {
    return this.props.dates.map((day, index) => {
      return (
        <View key={index} style={Styles.day}>
          <Text style={[Styles.dayTitle, this.state.dayIndex === index && Styles.dayTitleSelected]}>
            {this._dayOfWeek(day.date)}
          </Text>
          <Text style={[Styles.daySubTitle, this.state.dayIndex === index && Styles.daySubTitleSelected]}>
            {this._dateFormatted(day.date)}
          </Text>
        </View>
      );
    });
  }

  _generateTimePickers = () => {
    return this.props.dates.map((day, index) => {
      return <TimePicker 
                key={index} 
                ref={timePicker => this.timePickers[index] = timePicker} 
                date={day.date}
                timeSlots={day.timeSlots} 
                onSelect={this._timeChanged}></TimePicker>;
    })
  }

  _isMovingLeft = (gestureState) => {
    return gestureState.vx < 0
  }

  _isMovingRight = (gestureState) => {
    return gestureState.vx > 0
  }

  _startPositionForIndex = (index) => {
    return -index * this.width;
  }

  _nearestIndexToPosition = (position) => {
    return Math.round(Math.abs(position/this.width));
  }

  _timeChanged = (selectedTimeIndex) => {
    this.setState({timeIndex: selectedTimeIndex});
    this._selectArrivalTime(this.state.dayIndex, selectedTimeIndex);
  }

  _dayChanged = (selectedDayIndex) => {
    this.setState({dayIndex: selectedDayIndex});
    const selectedTimeIndex = this.timePickers[selectedDayIndex].selectedIndex();
    this._selectArrivalTime(selectedDayIndex, selectedTimeIndex);
  }

  _selectArrivalTime = (selectedDayIndex, selectedTimeIndex) => {
    let selectedDate = this.props.dates[selectedDayIndex];
    let selectedTimeSlot = selectedDate.timeSlots[selectedTimeIndex];
    this.props.onSelect(`Selected ${selectedDate.date} between ${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}`);
  }

  _dayOfWeek = (date) => {
    let daysFromToday = Math.ceil(moment(date, Metrics.dateFormat).diff(moment().format(), 'hours') / 24);

    switch(daysFromToday) {
      case 0:
        return "Today"
      case 1:
        return "Tomorrow";
      default:
        return moment(date, Metrics.dateFormat).format("dddd");
    }
  }

  _dateFormatted = (date) => {
    return moment(date, Metrics.dateFormat).format("MMM Do");
  }

  componentWillMount() {

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (event, gestureState) => {
        // Return true if the distance and velocity are both mostly horizontal    
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3) && 
          Math.abs(gestureState.vx) > Math.abs(gestureState.vy * 3)
        );
      },

      onPanResponderGrant: () => {
        this.state.offset.setValue(this.state.position._value);
      },

      onPanResponderMove: (event, gestureState) => {
        const isMovingLeft = this._isMovingLeft(gestureState);
        const isMovingRight = this._isMovingRight(gestureState);
        const isFirstDay = this.state.dayIndex === 0;
        const isLastDay = this.state.dayIndex === this.numDays - 1;

        if((isMovingLeft && !isLastDay) || (isMovingRight && !isFirstDay)) {
          const newPosition = gestureState.dx + this.state.offset._value;
          this.state.position.setValue(newPosition);
        }
      },

      onPanResponderRelease: () => {
        const nearestDay = this._nearestIndexToPosition(this.state.position._value);
        const nearestDayStartPosition = this._startPositionForIndex(nearestDay);
        Animated.spring(this.state.position, {
          toValue: nearestDayStartPosition
        }).start();
        this._dayChanged(nearestDay);
      }
    });
  }

  render() {

    let daysTransform = {
      // Pan the day titles 3x slower than the timeSlots
      transform: [{translateX: Animated.divide(this.state.position, new Animated.Value(3))}]
    };
    let timeSlotsTransform = {
      transform: [{translateX: this.state.position}]
    }
    return (
      <View style={Styles.dayPicker}>
        <Animated.View style={[Styles.daysContainer, daysTransform]} {...this._panResponder.panHandlers}>
            {this._generateDays()}
        </Animated.View>
        <View style={Styles.separator}>
          <View style={Styles.separatorSection}></View>
          <View style={[Styles.separatorSection, Styles.separatorSectionHighlight]}></View>
          <View style={Styles.separatorSection}></View>
        </View>
        <Animated.View style={[Styles.timePickerContainer, timeSlotsTransform]} {...this._panResponder.panHandlers}>
            {this._generateTimePickers()}
        </Animated.View>
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  dayPicker: {
    flex: 1,
    flexDirection: "column",
    width: Metrics.screenWidth,
    backgroundColor: Color.primaryDarker,
  },
  daysContainer: {
    flex: 0,
    flexShrink: 1,
    flexDirection: "row",
    paddingLeft: Metrics.screenWidth / 3,
    backgroundColor: Color.primary,
  },
  day: {
    flex: 1,
    flexBasis: Metrics.screenWidth / 3,
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    textAlign: "center",
    backgroundColor: Color.primary,
  },
  dayTitle: {
    ...Font["medium"],
    fontSize: 18,
    color: Color.primaryLightest,
  },
  dayTitleSelected: {
    color: Color.action,
  },
  daySubTitle: {
    ...Font["medium"],
    fontSize: 12,
    color: Color.primaryLight,
  },
  daySubTitleSelected: {
    color: Color.action,
  },
  separator: {
    flexDirection: "row",
    height: 3,
    backgroundColor: Color.primary,
  },
  separatorSection: {
    flex: 1,
  },
  separatorSectionHighlight: {
    backgroundColor: Color.action,
  },
  timePickerContainer: {
    flex: 1,
    flexGrow: 1,
    flexDirection: "row",
  },
});