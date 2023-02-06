
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

module.exports = {
    dateToString: (date) => {
        var day = date.getDate();
        const j = day % 10;
        const k = day % 100;
        if (j == 1 && k != 11) {
            day += "st";
        } else if (j == 2 && k != 12) {
            day += "nd";
        } else if (j == 3 && k != 13) {
            day += "rd";
        } else {
            day += "th";
        }
        return day + " " + months[date.getMonth()] + " " + date.getFullYear();
    },
    timeToString: (date) => {
        return `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
    },
    dateTimeToString: (date) => {
        return `${module.exports.dateToString(date)}, ${module.exports.timeToString(date)}`;
    },
};
