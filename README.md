[![Build Status](https://travis-ci.com/iFaxity/js-projekt-server.svg?branch=master)](https://travis-ci.com/iFaxity/js-projekt-server)
[![Build Status](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/badges/build.png?b=master)](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/iFaxity/js-projekt-server/?branch=master)



## Installera moduler

För att installera modulerna kör:

`npm install`



## Skapa .env fil

.env filer behöver inte skapas då dem skickas med, men ändra gärna alla JWT_ variabler efter eget tycke.



## Skapa databas och starta servern

Nu kan vi skapa databasen och starta vår server (Databasen skapas vid start on den inte redan finns).
Då kör vi:

`npm run start`

Sedan ska servern startas på porten som är uppsatt i .env filen (3003 om inte ändrad).



## Backend

Själva serrvern bygger på server ramverket Koa som likar Express men är mer nerskalad och man välver själv vilka moduler man vill ha med.
Dess middleware system är bättre då det bygger på async functioner i varje middleware med tanke på att mycket en server gör behöver vara asynkront gör det allt mycket lättare.

Databasen jag använder är Mongodb, i databasen sparas användarna och alla "aktiernas" data.
Socket.io används även för att enkelt hantera realtids aspekten på servern.



## Realtid

Servern skickar uppdateringar på priser varje fem sekunder via Websockets med hjälp av socket.io. Priserna simuleras via olika variabler som bestämmer om en "aktie" är volatil eller om den ska vara mer stabil.

Där är även ett "boost" system som ser till så inte aktierna blir värda för mycket eller krashar helt.



## Tester backend

Testerna använder sig av Mocha och Chai, i vissa delar används dock Nodes inbygga assert modul istället för Chai. Tycker det gick ganska lätt att få bra kodtäckning, siktade på att få över 80 procent och uppnådde runt 80-85% kodtäckning. Integrationstesterna blev lite minimala om man jamför med mina enhetstester, testar bara 2 fall per route medans jag försökte testa varje fall i mina enhetstester.

CI Kedjan jag använder är Scrutinser och Travis CI.
Tycker det var lätt att få Travis till att fungera men Scrutinzer had jag problem med, fick inte deras kod analyzerare till att fungera. Även efter att ha provat runt 10 olika konfigurationer. Tycker verktygen fungerar bra då jag inte behöver testa efter varje push utan det görs automatiskt. Så kan jag fokusera på att pusha kod och kolla senare var felen finns.

Innan min kod analyzering försvann från scrutinizer visade den 8.72 eller så så är ganska nöjd med det resultatet. Hade bara fel med en fil (ws.js) den klagade på som jag sedan fixade.
