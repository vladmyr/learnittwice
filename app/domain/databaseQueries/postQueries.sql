-- Alter `sense` table
ALTER TABLE `sense` DROP FOREIGN KEY `sense_ibfk_1`, DROP FOREIGN KEY `sense_ibfk_3`;

ALTER TABLE `sense`
    ADD `id` INT NULL ,
    CHANGE COLUMN `baseLemmaId` `baseLemmaId` INT(11) NOT NULL DEFAULT 0 ,
    CHANGE COLUMN `wordformId` `wordformId` INT(11) NOT NULL DEFAULT 0 ,
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`synsetId`, `languageId`, `lemmaId`, `wordformId`, `baseLemmaId`);

CREATE UNIQUE INDEX `id` ON `sense` (`id`);
ALTER TABLE `sense`
    CHANGE COLUMN `id` `id` INT NULL AUTO_INCREMENT,
    ADD CONSTRAINT `sense_ibfk_1`
      FOREIGN KEY (`baseLemmaId`)
      REFERENCES `lemma` (`id`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    ADD CONSTRAINT `sense_ibfk_3`
      FOREIGN KEY (`wordformId`)
      REFERENCES `wordform` (`id`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;

-- Alter `lemmainfo` table
ALTER TABLE `lemmainfo`
    DROP FOREIGN KEY `lemmainfo_ibfk_1`,
    DROP FOREIGN KEY `lemmainfo_ibfk_2`;

ALTER TABLE `lemmainfo`
    CHANGE COLUMN `id` `id` INT NULL ,
    CHANGE COLUMN `lemmaId` `lemmaId` INT(11) NOT NULL DEFAULT 0 ,
    CHANGE COLUMN `languageId` `languageId` INT(11) NOT NULL DEFAULT 0 ,
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`lemmaId`, `languageId`);

CREATE UNIQUE INDEX `id` ON `lemmainfo` (`id`);
ALTER TABLE `lemmainfo`
    CHANGE COLUMN `id` `id` INT NULL AUTO_INCREMENT,
    ADD CONSTRAINT `lemmainfo_ibfk_1`
      FOREIGN KEY (`lemmaId`)
      REFERENCES `lemma` (`id`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    ADD CONSTRAINT `lemmainfo_ibfk_2`
      FOREIGN KEY (`languageId`)
      REFERENCES `language` (`id`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;

-- Populate table "language"
INSERT IGNORE INTO `language` (`id`, `iso3166a2`) VALUES (1, 'ua');
INSERT IGNORE INTO `language` (`id`, `iso3166a2`) VALUES (2, 'pl');
INSERT IGNORE INTO `language` (`id`, `iso3166a2`) VALUES (3, 'gb');

-- Populate table "wordform"
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (1, 'noun');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (2, 'verb');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (3, 'adjective');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (4, 'adverb');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (5, 'pronoun');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (6, 'preposition');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (7, 'conjunction');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (8, 'interjection');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (9, 'clause');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (10, 'adjective_satellite');
INSERT IGNORE INTO `learnittwicev1`.`wordform` (`id`, `pos`) VALUES (11, null);

