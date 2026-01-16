# JS Fetch Lifecycle – Booking Demo

Mini gyakorló projekt a JavaScript fetch lifecycle megértésére:
**loading, success, error, retry, race condition kezelés**.

## 🎯 Cél
- Fetch állapotkezelés gyakorlása (`idle / loading / success / error`)
- Retry és hibakezelés megvalósítása
- Per-item (slotonkénti) booking UI szimulálása
- Felkészülés egy későbbi időpontfoglaló rendszer (booking flow) fejlesztésére

## 🛠 Tech
- Vanilla JavaScript (framework nélkül)
- HTML / CSS
- Mockolt API (időzített, véletlenszerű hibákkal)

## ⚙️ Funkciók
- Szolgáltatás + dátum kiválasztás
- Időpontok lekérése állapotkezeléssel
- Loading / error / success UI visszajelzések
- Retry funkció lekérésnél és foglalásnál
- Race condition védelem (`requestId`)
- Slotonkénti foglalás külön lifecycle-lel
- Event delegation dinamikus elemekhez

## 🧠 Tanult koncepciók
- State-vezérelt UI renderelés
- Fetch lifecycle kezelése backend nélkül
- Aszinkron folyamatok vizuális lekövetése
- Separation of concerns (state / render / action)
- Skálázható alap egy valódi booking rendszerhez

## 🚀 Indítás
Egyszerűen nyisd meg az `index.html` fájlt egy modern böngészőben.  
Nincs build lépés vagy külső függőség.

## 📝 Megjegyzés
Ez egy **tanulási és portfólió projekt**, nem production ready alkalmazás.  
A mockolt API véletlenszerű hibákat generál a valós élethelyzetek szimulálására.