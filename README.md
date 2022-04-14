# Server v1
This is the first version of the code and the web pages for the [CyberVolunteers](http://cybervolunteers.org.uk/) website. The current website runs the second version of the code that is being kept private for security reasons.

Please visit the [CyberVolunteers](http://cybervolunteers.org.uk/) website for more information on the project's goals.

## The software used
- Node.js
- Express.js
- Handlebars (for templating, mainly to include csrf tokens in the page)
- JQuery
- MySql

## The folder structure
The `code/` folder contains all the main code. The `popCornWebsite/` folder contains some react files that have been copied over to replace some of the pages to give them a new look.

## Running the code
Run `npm i` in the `code` folder to install the dependencies. Make sure that MySql has been installed. After that, start the server with `node index.js` or `nodemon index.js` if you want to live-refresh the code as you are editing it.
