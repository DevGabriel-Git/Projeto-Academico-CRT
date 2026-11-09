---
description: Proíbe códigos de status HTTP como números mágicos em controllers
condition: "status\\((200|201|204|400|404|409|500)\\)"
globs: ["src/main/**/*.java"]
---
Use HttpStatus.CREATED, HttpStatus.NOT_FOUND etc. em vez de números mágicos.
