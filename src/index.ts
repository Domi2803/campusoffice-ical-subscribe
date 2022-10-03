import express from 'express';
import needle from 'needle';
import ical from 'node-ical';
import icalgen from 'ical-generator';

interface VEVENT2 extends ical.VEvent {
    category: string
}

const app = express();
const port = process.env.PORT || 3000;

const user = process.env.USER;
const password = process.env.PASSWORD;

const campusOfficeLink = "https://www.campusoffice.fh-aachen.de/views/calendar/iCalExport.asp?startdt={STARTDATE}&enddt={ENDDATE}%2023:59:59"
const campusOfficeRedirLink = "https://www.campusoffice.fh-aachen.de/views/campus/search.asp";

// calculate the current semester dates, for example 01.09.2022 - 28.02.2023 or 01.03.2023 - 31.08.2023
const getCurrentSemesterDates = () => {
    const today = new Date()
    const month = today.getMonth()
    const year = today.getFullYear()
    const start = month >= 2 && month <= 8 ? new Date(year, 2, 1) : new Date(year, 8, 1)
    const end = month >= 2 && month <= 8 ? new Date(year, 8, 31) : new Date(year + 1, 2, 28)
    return {
        start: start,
        end: end
    }
}

// create a link to the campus office calendar with the current semester dates
const getCurrentSemesterLink = () => {
    const dates = getCurrentSemesterDates()
    return campusOfficeLink
        .replace("{STARTDATE}", dates.start.toISOString().split('T')[0])
        .replace("{ENDDATE}", dates.end.toISOString().split('T')[0])
}

app.get("/calendar", async (req, res) => {
    const link = getCurrentSemesterLink()
    console.log(link);
    // Required arguments for login
	const data = {
        size: null,
		screensize: 1024,
		u: user,      // Username
		p: password,  // Password
		login: "Login",   // Don't know
        privSecure: null
	};
    var loginCookies: string[] = [];
    console.log(data);

    needle.post(campusOfficeRedirLink, data, {}, function (error, response) {
		var cookies = response.headers['set-cookie'] || [];
		cookies.forEach(function (item) {
			loginCookies.push(item.split(";")[0]);
		});

		var options = {headers: {Cookie: loginCookies.join(";")}};

		needle.get(link, options, function (error, response) {
			// res.write((response.body));
			// res.end();
            var icsContent = response.body;
            var calendar = ical.parseICS(icsContent);
            const newCal = icalgen({name: 'FH Aachen'});
            for(const event of Object.values(calendar) as VEVENT2[]) {
                if(event.type == "VEVENT") {
                    var tag = event.category.split(" ")[1] || "";

                    newCal.createEvent({
                        start: event.start,
                        end: event.end,
                        summary: tag == "" ? event.summary : tag + " " + event.summary,
                        description: event.description,
                        location: event.location,
                        url: event.url
                    });
                }
            }
            res.send(newCal.toString());
		});

	});
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});