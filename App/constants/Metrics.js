import { Dimensions } from "react-native";

const Metrics = {
    screenWidth: Dimensions.get('window').width,
    arrivalTimeWindow: 1,       // hours per time slow
    dateFormat: "M/D/YYYY",
    timeFormat: "h:mm A",
    timeSlotHeight: 40,         // Height of each selectable time slot
}

export default Metrics;