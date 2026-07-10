/**
 * schedule.js
 *
 * Generates Today's Schedule dynamically.
 */

(() => {

    const DAYS = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const today = new Date();

    const dayName = DAYS[today.getDay()];

    const schedule = timetable[dayName] || [];

    const dateElement = document.getElementById("today-date");

    const statusIcon = document.getElementById("status-icon");
    const statusTitle = document.getElementById("status-title");
    const statusSubtitle = document.getElementById("status-subtitle");
    const statusInfo = document.getElementById("status-info");
    const statusTime = document.getElementById("status-time");

    const scheduleList = document.getElementById("schedule-list");

    //---------------------------------------------------------
    // Back Button
    //---------------------------------------------------------

    document
        .getElementById("back-btn")
        .addEventListener("click", () => history.back());

    //---------------------------------------------------------
    // Date
    //---------------------------------------------------------

    dateElement.textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    //---------------------------------------------------------
    // Holiday
    //---------------------------------------------------------

    if (schedule.length === 0) {

        statusIcon.textContent = "🌴";
        statusTitle.textContent = "Holiday";
        statusSubtitle.textContent = "No Classes Today";
        statusInfo.textContent = "";
        statusTime.textContent = "Enjoy your day!";

        return;

    }

    //---------------------------------------------------------
    // Current Time
    //---------------------------------------------------------

    const nowMinutes =
        today.getHours() * 60 +
        today.getMinutes();

    //---------------------------------------------------------
    // Helper
    //---------------------------------------------------------

    function toMinutes(time) {

        const [h, m] = time.split(":").map(Number);

        return h * 60 + m;

    }

    //---------------------------------------------------------
    // Find Status
    //---------------------------------------------------------

    let currentClass = null;
    let nextClass = null;

    schedule.forEach(cls => {

        const start = toMinutes(cls.start);
        const end = toMinutes(cls.end);

        if (nowMinutes >= start && nowMinutes <= end) {

            currentClass = cls;

        } else if (nowMinutes < start && !nextClass) {

            nextClass = cls;

        }

    });

    //---------------------------------------------------------
    // Status Card
    //---------------------------------------------------------

    if (currentClass) {

        const remaining =
            toMinutes(currentClass.end) -
            nowMinutes;

        statusIcon.innerHTML = `
<div class="live-indicator">
    <span class="live-dot"></span>
    CURRENT CLASS
</div>
`;
        statusTitle.textContent = "Current Class";
        statusSubtitle.textContent = currentClass.subject;
        statusInfo.textContent =
            `${currentClass.room} • ${currentClass.teacher}`;

        const hrs = Math.floor(remaining / 60);
        const mins = remaining % 60;

        statusTime.textContent =
            hrs > 0
                ? `Ends in ${hrs} hr ${mins} min`
                : `Ends in ${mins} min`;

    }

    else if (nextClass) {

        const remaining =
            toMinutes(nextClass.start) -
            nowMinutes;

        statusIcon.innerHTML = `
<div class="hourglass-spin">
    <i class="ph-fill ph-hourglass-high"></i>
</div>
`;
        statusTitle.textContent = "Next Class";
        statusSubtitle.textContent = nextClass.subject;
        statusInfo.textContent =
            `${nextClass.room} • ${nextClass.teacher}`;

        const hrs = Math.floor(remaining / 60);
const mins = remaining % 60;

        statusTime.textContent =
            hrs > 0
                ? `Starts in ${hrs} hr ${mins} min`
                : `Starts in ${mins} min`;

    }

    else {

        statusIcon.textContent = "🎉";
        statusTitle.textContent = "College Over";
        statusSubtitle.textContent =
            "All Classes Finished";

        statusInfo.textContent = "";

        statusTime.textContent =
            "See you tomorrow!";

    }

    //---------------------------------------------------------
    // Cards
    //---------------------------------------------------------

    schedule.forEach(cls => {

        const start = toMinutes(cls.start);
        const end = toMinutes(cls.end);

        let state = "schedule-upcoming";
let badge = "";

if (nowMinutes > end) {

    state = "schedule-completed";

    const ago = nowMinutes - end;

    if (ago < 60)
        badge = `✓ Ended ${ago} min ago`;
    else
        badge = `✓ Completed`;

}

else if (
    nowMinutes >= start &&
    nowMinutes <= end
) {

    state = "schedule-current";

    const left = end - nowMinutes;

    badge = `🟢 Ends in ${left} min`;

}

else {

    const left = start - nowMinutes;

    if (left < 60) {

        badge = `⏳ Starts in ${left} min`;

    }

    else {

        const hrs = Math.floor(left / 60);
        const mins = left % 60;

        badge = `⏳ Starts in ${hrs} hr ${mins} min`;

    }

}   

        scheduleList.insertAdjacentHTML(
            "beforeend",

            `
            <div class="schedule-card ${state}">

                <div class="schedule-subject">

                    ${cls.subject}

                </div>

                <div class="schedule-time">

                    ${cls.start} - ${cls.end}

                </div>

                <div class="schedule-room">

                    📍 ${cls.room}

                </div>

                <div class="schedule-teacher">

                    👨‍🏫 ${cls.teacher}

                </div>

                <span class="schedule-badge">

                    ${badge}

                </span>

            </div>
            `
        );

    });

})();

// document
//     .getElementById("back-btn")
//     .addEventListener("click", () => {

//         if (history.length > 1) {

//             history.back();

//         } else {

//             window.location.href = "index.html";

//         }

//     });