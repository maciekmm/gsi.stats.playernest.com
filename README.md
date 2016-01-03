stats.playernest.com
----------------------

stats.playernest.com is being made to track your progress and form in cs:go. It uses GSI to gather information.


TODO
====

## Server

- Input validation/sanitization
- Fixing isContinuation/isTrash methods
- Moving matches to separate collection

## Routes

- GET /matches/:steamid/?after=time / before=time&limit=5 //returns matches for specific player [permission required],
- GET /profile/:steamid/?span=week //returns profile info for specific player as well as basic stats (kills, deaths, assists, kd-ratio) [permission required].

## Client

- Storing matches in local storage
- Live matches with shareable link (websockets or long poll)
