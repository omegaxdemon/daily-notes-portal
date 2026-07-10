(() => {

    const widget = document.getElementById("schedule-widget");
    const content = document.getElementById("widget-content");

    if (!widget || !content) return;

    widget.addEventListener("click", () => {
        window.location.href = "schedule.html";
    });

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

    function toMinutes(time) {

        const [h, m] = time.split(":").map(Number);

        return h * 60 + m;

    }

    const nowMinutes =
        today.getHours() * 60 +
        today.getMinutes();

    // Holiday
    if (schedule.length === 0) {

        content.innerHTML = `
    <div class="widget-state">🌴 Holiday</div>

    <div class="widget-subject">
        No Classes Today
    </div>

    <div class="widget-room">
        Enjoy your day!
    </div>
`;

        return;

    }

    let currentClass = null;
    let nextClass = null;

    schedule.forEach(cls => {

        const start = toMinutes(cls.start);
        const end = toMinutes(cls.end);

        if (
            nowMinutes >= start &&
            nowMinutes <= end
        ) {

            currentClass = cls;

        }

        else if (
            nowMinutes < start &&
            !nextClass
        ) {

            nextClass = cls;

        }

    });

    if (currentClass) {

        const left =
            toMinutes(currentClass.end) -
            nowMinutes;

        content.innerHTML = `
    <div class="widget-state live">
        <span class="live-dot"></span>

        CURRENT CLASS
    </div>

    <div class="widget-subject">
        ${currentClass.subject}
    </div>

    <div class="widget-room">
        📍 ${currentClass.room}
    </div>

    <div class="widget-time">
        Ends in ${left} min
    </div>
`;

    }

    else if (nextClass) {

        const left =
            toMinutes(nextClass.start) -
            nowMinutes;

        content.innerHTML = `
    <div class="widget-state">
        ⏳ NEXT CLASS
    </div>

    <div class="widget-subject">
        ${nextClass.subject}
    </div>

    <div class="widget-room">
        📍 ${nextClass.room}
    </div>

    <div class="widget-time">
        Starts in ${left} min
    </div>
`;

    }

    else {

        content.innerHTML = `
    <div class="widget-state">
        🎉 COLLEGE OVER
    </div>

    <div class="widget-subject">
        All Classes Finished
    </div>

    <div class="widget-room">
        See you tomorrow!
    </div>
`;

    }

})();