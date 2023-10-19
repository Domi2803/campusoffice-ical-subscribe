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



// function that return the start and end dates for the current semester, based on the current date.
// The winter semester starts on the first of september and ends on the 28th of february. The summer semester starts on the first of march and ends on the 31st of august.
// i..e. on the 12.01.2023 the output should be {start: 01.09.2022, end: 28.02.2023} and on the 12.07.2023 the output should be {start: 01.03.2023, end: 31.08.2023}.
const getCurrentSemesterDates = () => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    if (now.getMonth() >= 2 && now.getMonth() <= 7) {
        start.setMonth(2);
        start.setDate(1);
        start.setFullYear(now.getFullYear());
        end.setMonth(7);
        end.setDate(31);
        end.setFullYear(now.getFullYear());
    } else if (now.getMonth() >= 8) {
        start.setMonth(8);
        start.setDate(1);
        start.setFullYear(now.getFullYear());
        end.setMonth(1);
        end.setDate(28);
        end.setFullYear(now.getFullYear() + 1);
    } else {
        start.setMonth(8);
        start.setDate(1);
        start.setFullYear(now.getFullYear() - 1);
        end.setMonth(1);
        end.setDate(28);
        end.setFullYear(now.getFullYear());
    }
    return { start: start, end: end };
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
        initlang: "de",   
	};
    var loginCookies: string[] = [];

    needle.post(campusOfficeRedirLink, data, {}, function (error, response) {
		var cookies = response.headers['set-cookie'] || [];
		cookies.forEach(function (item) {
			loginCookies.push(item.split(";")[0]);
		});

        if(error) console.error(error);
        console.log(response.statusCode);
        console.log(response.body);
		var options = {headers: {Cookie: loginCookies.join(";")}};
        console.log(link);
        console.log(cookies);
		needle.get(link, options, function (error, response) {
            console.log(response.statusCode);
            console.log(response.body);
			// res.write((response.body));
			// res.end();
            if(error) console.error(error);
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