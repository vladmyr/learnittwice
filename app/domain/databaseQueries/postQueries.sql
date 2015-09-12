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

