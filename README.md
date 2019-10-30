[![Build Status](https://travis-ci.org/iFaxity/js-projekt-server.svg?branch=master)](https://travis-ci.org/iFaxity/js-projekt-server)
[![Build Status](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/badges/build.png?b=master)](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/?branch=master)

## Länk till github repo

https://github.com/ifaxity/js-projekt-server



## Installera moduler

För att installera modulerna kör:

`npm install`



## Skapa .env fil

.env filer behöver inte skapas då dem skickas med, men ändra gärna alla JWT_ variabler :).



## Skapa databas och starta servern

Nu kan vi skapa databasen och starta vår server (Databasen om den inte redan finns vid start).
Då kör vi:

`npm run start`

Sedan ska servern startas på porten som är uppsatt i .env filen (3000 om inte ändrad)
