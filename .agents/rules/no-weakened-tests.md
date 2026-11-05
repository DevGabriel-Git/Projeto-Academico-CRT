---
description: Interrompe o agente quando ele desativa ou esvazia um teste para fazê-lo passar
condition: '@Disabled|assertTrue\(true\)|assumeTrue\(false\)|assertThat\(true\)|//\s*@Test\b'
globs: ["src/test/**/*.java"]
scope: [tool]
---
Você está prestes a desativar ou esvaziar um teste. Num loop, isso faz a condição de parada mentir.
Não faça isso para "passar". Se o teste estiver errado, pare e registre um CONFLITO; se o código
estiver errado, corrija o código. Se estiver bloqueado, escreva BLOQUEIO nas notas do loop e encerre a iteração.
