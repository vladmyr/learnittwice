# Learn it twice
> Project status - **pre-alpha**

## What is this?
This is yet another pet project aimed to help to learn new educational material using spaced repetition system technic.

## Why?
The motivation of developing such project is:
- Lack of flexibility to create custom materials in existing projects;
- Absence of tools to work with bulk data;
- Absence of ability to create dependency tree for material items.
The goal of this project is to overcome this limitations and bring some additional cookies.

## Developers documentation
The project is annotated with JSdoc comments. In order to generate documentation execute:
````
node_modules/.bin/jsdoc --configure ./config/jsdoc/jsdoc.json
````

## Developers change log
- 0.0.1 - project's initial state
    * Server initialization functionality
    * Defined main sequelize models;
    * Defined wordnet importers.