# campusoffice-ical-subscribe
 A node-js app that can be used to make the FH-Aachen Campus Office iCal subscribable in Google Calendar etc.

# Build
 Set the environment variables *USER* and *PASSWORD*. *USER* should be your ``FH-Kennung``, and *PASSWORD* should be the password you use to login to *CampusOffice*.


 Install the dependencies with

    npm install

and then compile with 

    tsc

and finally run with

    node index.js


If you clone the branch ``hassio``, you can install the server as an addon on a Home Assistant instance.

