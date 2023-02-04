let response = fetch("timetableData.json");
let { data, thumbnail } = response.json();
document.querySelector('meta[property="og:image"]').setAttribute("content", thumbnail);

window.onload = async () => {
    const table = document.getElementsByClassName("Timetable")[0].getElementsByTagName("tbody")[0];
    const timestamp = document.getElementById("timestamp");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    let count = 0;

    const getLessons = () => {
        let lessons = [[], [], [], [], []];
        data.cells.forEach((cell) => {
            if (cell.length) {
                cell = cell.slice(cell.length - 5);
                for (let i = 0; i < cell.length; i++) {
                    const slot = cell[i];
                    if (slot.length === 0) continue;
                    count++;
                    lessons[i].push(slot.match(/(?<startTime>\d\d:\d\d) - (?<endTime>\d\d:\d\d) (?<course>.*) A Level .* (?<room>.*)/).groups);
                }
            }
        });
        return lessons;
    };
    let lessons = getLessons();

    const getDay = () => {
        if (count) {
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
        }
        return "Vacation";
    };

    if (count)
        getLessons()[getDay()].forEach((lesson) => {
            let row = table.insertRow(-1);
            row.insertCell(0).innerHTML = lesson.startTime + "-" + lesson.endTime;
            row.insertCell(1).innerHTML = lesson.course.replace(" Linear", "");
            row.insertCell(2).innerHTML = lesson.room;
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

    if (getDay() == "Vacation") document.getElementById("day").innerHTML = "Vacation";
    else document.getElementById("day").innerHTML = days[getDay()];
};
