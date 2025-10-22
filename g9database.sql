DROP DATABASE g9database;
CREATE DATABASE g9database;

USE g9database;

CREATE TABLE IF NOT EXISTS `User`
(
    `UserID` INT(4) AUTO_INCREMENT,
    `Username` NVARCHAR(50) NOT NULL,
    `Password` NVARCHAR(30) NOT NULL,
    `Mean_FTime` FLOAT,
    `Mean_HTime` Float,
    `Std_FTime` FLOAT,
    `Std_HTime` Float,
    CONSTRAINT `PK_User` PRIMARY KEY (`UserID`)
);

SELECT * FROM `User`;
