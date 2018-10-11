import moment from "moment";
import Metrics from "./Metrics";

// Generate mock time data for every hour in the day
const generateTimeSlots = () => {
    let timeSlots = [];
    for(let i=0; i < (24 - Metrics.arrivalTimeWindow); i++) {
        const startTime = moment().add(i, 'hours').minutes(0);
        const endTime = moment(startTime).add(Metrics.arrivalTimeWindow, 'hours');
        timeSlots.push({
            startTime: startTime.format(Metrics.timeFormat),
            endTime: endTime.format(Metrics.timeFormat),
            available: Math.floor(Math.random() * 5) !== 1  // Randomly make some time slots unavailable
        });
    }
    return timeSlots;
}

// Generate mock dates for the next 30 days
const generateDates = () => {
    let dates = []
    for(let i=0; i < 30; i++) {
        dates.push({
            date: moment().add(i,'day').format(Metrics.dateFormat),
            timeSlots: generateTimeSlots()
        });
    }
    return dates;
}

const dates = generateDates();

const ArrivalTimes = [
    ...dates
];

export default ArrivalTimes;