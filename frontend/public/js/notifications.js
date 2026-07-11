/**
 * notifications.js
 *
 * Reads notifications.json
 * Sorts notices by latest date
 * Shows a NEW indicator for today's notices
 * Renders glass cards dynamically
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

    //---------------------------------------------------------
    // Page Elements
    //---------------------------------------------------------

    const dateElement =
        document.getElementById("today-date");

    const list =
        document.getElementById("notifications-list");

    //---------------------------------------------------------
    // Back Button
    //---------------------------------------------------------

    document
        .getElementById("back-btn")
        .addEventListener("click", () => history.back());

    //---------------------------------------------------------
    // Date Heading
    //---------------------------------------------------------

    dateElement.textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    //---------------------------------------------------------
    // Parse DD/MM/YY
    //---------------------------------------------------------

    function parseDate(dateString) {

        const [d, m, y] = dateString.split("/");

        return new Date(
            Number(`20${y}`),
            Number(m) - 1,
            Number(d)
        );

    }

    //---------------------------------------------------------
    // Is Today?
    //---------------------------------------------------------

    function isToday(dateString) {

        const date = parseDate(dateString);

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );

    }

    //---------------------------------------------------------
    // Pretty Date
    //---------------------------------------------------------

    function prettyDate(dateString){

        const date = parseDate(dateString);

        return date.toLocaleDateString(
            "en-IN",
            {
                day:"numeric",
                month:"short",
                year:"numeric"
            }
        );

    }

    //---------------------------------------------------------
    // Type Labels
    //---------------------------------------------------------

    

    //---------------------------------------------------------
    // Load Notifications
    //---------------------------------------------------------

    async function loadNotifications(){

        try{

            const response =
                await fetch("/frontend/public/notifications.json");

            const notices =
                await response.json();
            if (!Array.isArray(notices) || notices.length === 0) {
            list.innerHTML = `
                <div class="glass-panel empty-state">
                    <div class="icon">
                        <i class="ph ph-bell"></i>
                    </div>
                    <div class="title">
                        No Notices Yet
                    </div>
                    <div>
                        There are currently no notices to display.
                    </div>
                </div>`;
            return;
        }

            notices.sort((a,b)=>
                parseDate(b.date) -
                parseDate(a.date)
            );

            list.innerHTML="";

            notices.forEach((notice,index)=>{

                list.insertAdjacentHTML(

                    "beforeend",

                    `
                    <div class="notification-card fade-in-up stagger-${Math.min(index+1,4)}">

                        <div class="notification-top">

    <div class="notification-type">

        <span class="${
            isToday(notice.date)
                ? "new-dot"
                : "old-dot"
        }"></span>

        ${
            isToday(notice.date)
                ? "New Notice"
                : "Notice"
        }

    </div>

</div>

<div class="notification-title">

    ${notice.title}

</div>

<div class="notification-date">

    ${prettyDate(notice.date)}

</div>

                    </div>
                    `

                );

            });

        }

        catch(err){

            console.error(err);

            list.innerHTML=`

                <div class="glass-panel text-center p-5">

                    Unable to load notices.

                </div>

            `;

        }

    }

    //---------------------------------------------------------
    // Start
    //---------------------------------------------------------

    loadNotifications();

})();
