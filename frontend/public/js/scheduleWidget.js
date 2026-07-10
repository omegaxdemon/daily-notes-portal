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
            🌴 <strong>Holiday</strong><br>
            No classes today.
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
            🟢 <strong>Current Class</strong><br><br>

            <strong>${currentClass.subject}</strong><br>

            📍 ${currentClass.room}<br>

            Ends in ${left} min
        `;

    }

    else if (nextClass) {

        const left =
            toMinutes(nextClass.start) -
            nowMinutes;

        content.innerHTML = `
            ⏳ <strong>Next Class</strong><br><br>

            <strong>${nextClass.subject}</strong><br>

            📍 ${nextClass.room}<br>

            Starts in ${left} min
        `;

    }

    else {

        content.innerHTML = `
            🎉 <strong>College Over</strong><br>
            See you tomorrow.
        `;

    }

})();