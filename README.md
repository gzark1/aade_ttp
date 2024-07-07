# AADE TTP Application
## Overview
This project is an intermediary application designed to facilitate the seamless transfer of data between the AADE portal and other parties, such as insurance companies. The primary motivation for developing this application was the new ENFIA regulation, which requires insurance companies to transmit detailed information about insurance contracts to the AADE annually.

The application consists of two main servers:

App Server: Handles user authentication, data retrieval from the AADE portal, and data submission.
Company Server: Redirects users to the appropriate AADE service and receives the submitted data in JSON format.
## Key Components
### AADE TTP Application
The AADE TTP Application provides an interface for users to log in to AADE services, select relevant data, and submit it for further processing. Key functionalities include:

* User Authentication: Secure login to AADE services using provided credentials.
* Data Retrieval: Automated retrieval of property and land lot data from AADE using Puppeteer.
* Data Selection: Users can select specific records they wish to submit.
* Review and Confirmation: Users can review selected data and confirm submission.
* Error Handling: Comprehensive error handling for different kinds of errors, such as InvalidServiceError.
### Company Server
The Company Server facilitates the interaction between the user and the AADE TTP Application. It provides the following functionalities:

* User Redirection: Redirects users to the AADE TTP Application for the desired service (e.g., E9).
* Data Reception: Accepts JSON data from the AADE TTP Application at a designated endpoint.
 ## Installation
 Clone the repository:
```
git clone https://github.com/yourusername/aade-ttp-app.git
cd aade-ttp-app
```
Install dependencies:
```
npm install
```
Start the application:
```
node app.js
```
Start the company server:
```
node company.js
```
## Usage
1. Navigate to the company website (default: http://localhost:4000).
2. Select a service (e.g., E9 service) and proceed to the TTP application.
3. Log in using your AADE credentials.\
   \
Assuming that you chose e9, since it is the only service that is supported now: 
5. Select the desired property and land lot records and submit them.
6. Review the selected data and confirm the submission.
7. The data will be sent to the company's endpoint and displayed in JSON format.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements
* Bootstrap for providing the CSS framework.
* Puppeteer for enabling browser automation.
* AADE for their APIs and services.
* Athens University of Economics and Business (AUEB) for their support.

