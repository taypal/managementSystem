USE etracker_db;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Luke", "Skywalker", 1, 1);

INSERT INTO department (name)
VALUES ("Jedi Master");

INSERT INTO department (name)
VALUES ("Sith Lord");

INSERT INTO department (name)
VALUES ("Wookie");

INSERT INTO role (title, salary, department_id)
VALUES ("Jedi", 240000, 1);

INSERT INTO role (title, salary, department_id)
VALUES ("Darth", 12000, 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Chewy", 2000, 1);

