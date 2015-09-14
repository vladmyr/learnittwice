-- Alter `sense` table
ALTER TABLE `learnittwicev1`.`sense` DROP FOREIGN KEY `sense_ibfk_1`,
DROP FOREIGN KEY `sense_ibfk_2`,
DROP FOREIGN KEY `sense_ibfk_3`;
ALTER TABLE `learnittwicev1`.`sense`
CHANGE COLUMN `lemmaId` `lemmaId` INT(11) NOT NULL DEFAULT 0 ,
CHANGE COLUMN `synsetId` `synsetId` INT(11) NOT NULL DEFAULT 0 ,
CHANGE COLUMN `languageId` `languageId` INT(11) NOT NULL DEFAULT 0 ,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`lemmaId`, `synsetId`, `languageId`);
ALTER TABLE `learnittwicev1`.`sense`
ADD CONSTRAINT `sense_ibfk_1`
  FOREIGN KEY (`lemmaId`)
  REFERENCES `learnittwicev1`.`lemma` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `sense_ibfk_2`
  FOREIGN KEY (`synsetId`)
  REFERENCES `learnittwicev1`.`synset` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `sense_ibfk_3`
  FOREIGN KEY (`languageId`)
  REFERENCES `learnittwicev1`.`language` (`id`)
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

