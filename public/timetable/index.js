const table = document.getElementsByClassName("Timetable")[0]; //.getElementsByTagName("tbody")[0];
const timestamp = document.getElementById("timestamp");

window.onload = async () => {
    console.log("loaded");

    const response = await fetch("data.json");
    const { data } = await response.json();

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const getLessons = () => {
        let lessons = [[], [], [], [], []];
        data.cells.forEach((cell) => {
            if (cell.length) {
                cell = cell.slice(cell.length - 5);
                for (let i = 0; i < cell.length; i++) {
                    const slot = cell[i];
                    if (slot.length === 0) continue;
                    lessons[i].push(
                        slot.match(
                            /(?<startTime>\d\d:\d\d) - (?<endTime>\d\d:\d\d) (?<course>.*) A Level .* (?<room>.*)/
                        ).groups
                    );
                }
            }
        });
        return lessons;
    };

    const getDay = () => {
        let lessons = getLessons();
        function addDay() {
            schoolDay++;
            schoolDay = schoolDay >= 5 ? schoolDay - 5 : schoolDay;
        }

        function lessonsOver() {
            return (
                lessons[schoolDay] &&
                !lessons[schoolDay]
                    .map((lesson) => {
                        let date = new Date();
                        date.setHours(lesson.endTime.split(":")[0]);
                        return date < new Date();
                    })
                    .includes(false)
            );
        }

        function checkLessons() {
            while (!lessons[schoolDay] || lessons[schoolDay].length == 0) {
                addDay();
            }
        }
        let schoolDay = new Date().getUTCDay();
        schoolDay = schoolDay >= 7 ? schoolDay - 7 : schoolDay;

        if (schoolDay >= 6 || schoolDay == 0) {
            schoolDay = 0;
        } else schoolDay--;

        if (!lessons[schoolDay] || lessons[schoolDay].length == 0) {
            checkLessons();
        } else if (lessonsOver()) {
            addDay();
            checkLessons();
        }

        return schoolDay;
    };

    getLessons()[getDay()].forEach((lesson) => {
        let row = table.insertRow(-1);
        row.insertCell(0).innerHTML = lesson.startTime + "-" + lesson.endTime;
        row.insertCell(1).innerHTML = lesson.course.replace(" Linear", "");
        row.insertCell(2).innerHTML = room;
    });

    const refreshTimestamp = () => {
        let date = new Date();
        date.setTime(date.getTime() - data.timestamp);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let refreshTime = [];

        if (hours) {
            refreshTime.push(hours + " hour");
            if (hours > 1) refreshTime.push("s");

            if (minutes) {
                refreshTime.push(", " + minutes + " minute");
                if (minutes > 1) refreshTime.push("s");
            }
        } else {
            if (minutes) {
                refreshTime.push(minutes + " minute");
                if (minutes > 1) refreshTime.push("s, ");
                else refreshTime.push(", ");
            }
            if (seconds > 1) refreshTime.push(seconds + " seconds");
        }

        refreshTime.push(" ago");

        timestamp.innerHTML = refreshTime.join("");
        setTimeout(refreshTimestamp, 100);
    };

    refreshTimestamp();

    document.getElementById("day").innerHTML = days[getDay()];
};
