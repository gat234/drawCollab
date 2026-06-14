CREATE TABLE `images` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `url` text NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL DEFAULT '',
  `access_type` int(11) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `visit` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
)

CREATE TABLE `img_owners` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `user_ID` int(11) NOT NULL FOREIGN KEY REFERENCES users(ID),
  `img_ID` int(11) NOT NULL FOREIGN KEY REFERENCES images(ID),
  PRIMARY KEY (`ID`)
)

CREATE TABLE `users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `role` text NOT NULL DEFAULT 'draw',
  `password` text NOT NULL,
  `email` text NOT NULL,
  `token` text NOT NULL,
  `error` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
)