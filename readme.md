- fetch the data
  - get all users obj and store it
  - for each user, get the extra data and store it
  - store all information in local storage
  - in re-load: get data from local storge

- create & store html elements 
  - class HtmlTable Which stores an array of rows of table (each row displays one student's data), and has methods applied to those rows:
    - function add student - get student's data, create html tr that holds this data, and push it to the array of rows.
    - function get student by id - get student's id, and return his row
    - function remove student - get student's id, remove it from the 