# Petition
The idea behind this project is to create an online petition that visitors can sign to make their voice heard on an issue. In this case, it is a plastic issue. I know you care about our mothernature. Please visit my website and sign my petition: https://eechee.herokuapp.com

<img src="Petition-no-plastics.png">

## Features
1) Registration and Log-in
* A 'registered' table is created in the database. The table has columns for id (the primary key), first name, last name, email address,   and the hashed password.
* First name, last name, email address, and password are required fields. Email addresses are unique. Error message 'Invalid inputs detected, please insert again!' will pop out when users do not meet the requirements.
* After users register or log in, the id number of the user is stored in cookie-session. 
* Logged out users are automatically redirected to the registration page and req.session is set to null.

<img src="log-in.png">

2) Authentication
* Bcryptjs module is used to hash password when user registers and check the password when user logs in.

3) Cookie-session
* Cookies are set to remember the user ID and signature ID in this project. So that, all the relavant data is retrieved when the user revisits the website again.
* Additionally, cookie-session middleware is used to prevent cookie-tampering issue.
* In this project, cookies expire in two weeks.  

4) Profile data
* Immediately after registration, users are directed to a new page that asks them to provide more information about themselves.
* When the user submits this form, this data is saved in a table named 'profiles'. This table has the columns for id (primary key), user id (foreign key), age, city, and url. All of the fields in this form are optional.

<img src="personal-info.png">

4) Signature page
* A <canvas> element is used, so that, users can draw their signature on it. The image data is then converted to a long data url.
* When users submit the form, a POST request is made to server and the submitted data is inserted into a database table named 'signature'. This table has columns for id (the primary key), first name, last name, user ID and signature (the converted data url). 
* Apart from that, signature ID is set in the req.session.
  
  Responsive

<img src="signing-page.png">
