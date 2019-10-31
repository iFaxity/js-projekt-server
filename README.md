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

Tyckte att få igång servern var lite trögt då instruktionerna var lite luddiga och fick göra om en hel del kod ett par gånger.
Läste i chatten ibland och frågande andra hur dem tänkte för att få en klarare bild.
Så började på att designa användarsystemet och annat förarbete, men hade ingen riktning jag ville ta allt ännu.
Trodde först "trading platform" betydde en sida som blocket, och inte som en aktie sida.
Men efter mycket om och men så tyckte jag jag fick ihop allt ganska bra.

Valde att ta bort SQLite för att använda MongoDB till mina användare med, så behöver jag bara hålla en databaskoppling och ett ställe att hålla reda på all information.
Med tanke på att SQLite inte riktigt är en databas så tyckte jag det var bättre att spara allt i MongoDB, verkar både snabbare och säkrare.



## Realtid

Tog inte lång tid till att få websocketen till att fungera, men hade mer problem med att få priserna till att uppdateras "verkligt".
Så körde en snabbversion och satte servern på att uppdatera 10 gånger per sekund för att snabbt kunna se om där fanns några sprickor i koden.
Efter bara en i 10 minuter så hade priserna på två aktier överstigit 1000, medans en annan hade sjunkit under 0, vilket inte alls var bra.
Så bestämde mig för att göra ett system som såg till att priserna inte gick under 0 och inte heller över 50 ungefär.

Men det blev lätt fel då priserna stannade på 50, så byggde ett annat system som manipulerar "chanserna" så att det inte alltid är 50/50 om priset stiger eller sjunker.
Utan det ska adaptivt sänka chanserna på att priset ökar om det redan är högt, även att höja chanserna om priserna är låga.
Detta gör priserna mer stabila men tillåter även priser till att bli höra i ett litet tag och sedan krasha lite senare.
Gör det hela lite mer roligt och verkligt, samtidigt ser det bättre ut.



## Tester backend

Testerna använder sig av Mocha och Chai, i vissa delar används dock Nodes inbygga assert modul istället för Chai. Tycker det gick ganska lätt att få bra kodtäckning, siktade på att få över 80 procent och uppnådde runt 80-85% kodtäckning. Integrationstesterna blev lite minimala om man jamför med mina enhetstester, testar bara 2 fall per route medans jag försökte testa varje fall i mina enhetstester.
Hittade faktiskt några buggar efter jag hade gjort testerna så det var viktigare än vad jag trodde att få bra tester.

CI Kedjan jag använder är Scrutinser och Travis CI.
Tycker det var lätt att få Travis till att fungera men Scrutinzer had jag problem med, fick inte deras kod analyzerare till att fungera. Även efter att ha provat runt 10 olika konfigurationer. Tycker verktygen fungerar bra då jag inte behöver testa efter varje push utan det görs automatiskt. Så kan jag fokusera på att pusha kod och kolla senare var felen finns.

Innan min kod analyzering försvann från scrutinizer visade den 8.72 eller så så är ganska nöjd med det resultatet. Hade bara fel med en fil (ws.js) den klagade på som jag sedan fixade.
