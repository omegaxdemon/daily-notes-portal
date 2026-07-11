/**
 * index-notices.js
 *
 * Loads the latest 3 notifications
 * for the login page widget.
 */

(async () => {

    const container =
        document.getElementById("notice-widget-list");

    if (!container) return;

    const fab =
    document.getElementById("notification-fab");

    const badge =
    document.getElementById("notification-badge");

    try {

        const response =
            await fetch("/frontend/public/notifications.json");

        const notices =
            await response.json();

        //------------------------------------------------------
        // Empty
        //------------------------------------------------------

        if (
            !Array.isArray(notices) ||
            notices.length === 0
        ) {

            container.innerHTML = `

                <div class="widget-empty">

                    No notices available.

                </div>

            `;

            return;

        }

        //------------------------------------------------------
        // Date Helper
        //------------------------------------------------------

        function parseDate(date) {

            const [d, m, y] = date.split("/");

            return new Date(
                2000 + Number(y),
                Number(m) - 1,
                Number(d)
            );

        }

        //------------------------------------------------------
        // Pretty Date
        //------------------------------------------------------

        function prettyDate(date) {

            return parseDate(date)
                .toLocaleDateString("en-IN", {

                    day: "numeric",

                    month: "short",

                    year: "numeric"

                });

        }

        //------------------------------------------------------
        // Today Check
        //------------------------------------------------------

        function isToday(date) {

            const today = new Date();

            const d = parseDate(date);

            return (

                today.getDate() === d.getDate() &&

                today.getMonth() === d.getMonth() &&

                today.getFullYear() === d.getFullYear()

            );

        }

        //------------------------------------------------------
        // Sort Latest First
        //------------------------------------------------------

        notices.sort(

            (a, b) =>

                parseDate(b.date) -

                parseDate(a.date)

        );

        //------------------------------------------------------
        // Latest Three
        //------------------------------------------------------

        const latest = notices.slice(0, 3);

        //------------------------------------------------------
        // Render
        //------------------------------------------------------

        container.innerHTML = "";

        latest.forEach(notice => {

            container.insertAdjacentHTML(

                "beforeend",

                `

                <div class="widget-notice">

                    <div class="widget-notice-title">

                        <span class="${
                            isToday(notice.date)
                                ? "new-dot"
                                : "old-dot"
                        }"></span>

                        ${notice.title}

                    </div>

                    <div class="widget-notice-date">

                        ${prettyDate(notice.date)}

                    </div>

                </div>

                `

            );

        });

        //------------------------------------------------------
// Floating Button
//------------------------------------------------------

if (fab) {

    fab.addEventListener("click", () => {

        window.location.href = "notifications.html";

    });

}

if (badge) {

    const hasNewNotice =
        notices.some(notice => isToday(notice.date));

    badge.hidden = !hasNewNotice;

}

    }

    catch (err) {

        console.error(err);

        container.innerHTML = `

            <div class="widget-empty">

                Unable to load notices.

            </div>

        `;

    }

})();