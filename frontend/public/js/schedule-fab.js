(() => {

    const fab =
        document.getElementById("schedule-fab");

    const preview =
        document.getElementById("schedule-preview");

    const status =
    document.getElementById("schedule-preview-status");

    const subject =
    document.getElementById("schedule-preview-subject");

    const time =
    document.getElementById("schedule-preview-time");

    if (!fab || !preview) return;

    let expanded = false;
    let timer = null;

    //------------------------------------------------------
// Helpers
//------------------------------------------------------

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

function toMinutes(time){

    const [h,m]=time.split(":").map(Number);

    return h*60+m;

}

function updatePreview(){

    const now=new Date();

    const today=DAYS[now.getDay()];

    const schedule=timetable[today]||[];

    //--------------------------------------------------
    // Holiday
    //--------------------------------------------------

    if(schedule.length===0){

        status.innerHTML=
        `<i class="ph-fill ph-palm-tree"></i> HOLIDAY`;

        subject.textContent=
        "No Classes Today";

        time.textContent=
        "Enjoy your day!";

        return;

    }

    const nowMinutes=
        now.getHours()*60+
        now.getMinutes();

    let current=null;
    let next=null;

    schedule.forEach(cls=>{

        const start=toMinutes(cls.start);
        const end=toMinutes(cls.end);

        if(nowMinutes>=start && nowMinutes<=end){

            current=cls;

        }

        else if(nowMinutes<start && !next){

            next=cls;

        }

    });

    //--------------------------------------------------
    // Current Class
    //--------------------------------------------------

    if(current){

        const remaining=
            toMinutes(current.end)-nowMinutes;

        status.innerHTML=`
            <span class="live-dot"></span>
            LIVE
        `;

        subject.textContent=
            `${current.subject} • ${current.room} • ${current.teacher}`;

        time.textContent=
            `Ends in ${remaining} min`;

        return;

    }

    //--------------------------------------------------
    // Next Class
    //--------------------------------------------------

    if(next){

        const remaining=
            toMinutes(next.start)-nowMinutes;

        status.innerHTML=`
            <i class="ph-fill ph-hourglass-medium"></i>
            NEXT CLASS
        `;

        subject.textContent=
            `${next.subject} • ${next.room} • ${next.teacher}`;

        time.textContent=
            `Starts in ${remaining} min`;

        return;

    }

    //--------------------------------------------------
    // College Over
    //--------------------------------------------------

    status.innerHTML=
    `<i class="ph-fill ph-confetti"></i> COLLEGE OVER`;

    subject.textContent=
    "All classes finished.";

    time.textContent=
    "See you tomorrow!";

}

    function collapse() {

        preview.style.display = "none";

        expanded = false;

    }

    function expand() {

    updatePreview();

    preview.style.display = "flex";

    expanded = true;

    clearTimeout(timer);

    timer = setTimeout(() => {

        collapse();

    }, 5000);

}

    fab.addEventListener("click", () => {

        if (!expanded) {

            expand();

        }

        else {

            window.location.href = "schedule.html";

        }

    });

})();
