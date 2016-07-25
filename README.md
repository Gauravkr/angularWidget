# AutoIQ

This README outlines the details of collaborating on this application.
A short introduction of this app could easily go here.

==================
Technology Used
==================
    1. [NodeJS](http://nodejs.org/)
    2. [Bower]( npm install bower -g )
    3. [AngularJs](https://angularjs.org/)
    4. [Bootstrap](http://getbootstrap.com/)

**Steps to run Client**
---------
1. Navigate to the 'autoIQ' directory and run following commands
```
	   a. npm install  OR sudo npm install
       b. (sudo) npm install grunt -g && (sudo) npm install grunt-cli -g
	   c. (sudo) npm install bower -g (if bower is not earlier installed)
	   d. bower install
```
2. Now, configure the service URl in proxy file proxies.json
```
	      {
            "proxies": [
              {
                "host": "{service URl}",
                "port": {port},
                 ....
              }
            ]
        }
```
3. Now, type the following command to run the application
```
	      grunt run
```
