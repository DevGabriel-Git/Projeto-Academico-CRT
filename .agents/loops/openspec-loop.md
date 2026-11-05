# Loop de implementacao — uma tarefa por iteracao

Use branch isolado, loop.mode=reset, no maximo 12 iteracoes e condicao com timeout de 600s.
Leia a spec, tasks.md, loop-notes.md e git status da mudanca escolhida.
Escolha somente a primeira tarefa aberta, escreva o teste, registre RED real e implemente o minimo.
Execute a verificacao da tarefa, verify e rastreabilidade; marque concluida somente com evidencia.
Registre comando, resultado, arquivos e proximo passo em loop-notes.md.
Na segunda repeticao da mesma falha, ou diante de lacuna na spec, escreva BLOQUEIO: e encerre.
Nunca desabilite testes, reduza cobertura, altere a spec para passar, publique, faca push/merge ou arquive.
O commit local de uma tarefa requer autorizacao do titular; o aceite de publicacao e humano.
Condicao: `python scripts/loop_done.py <mudanca>`; PARAR e PRONTO encerram, CONTINUAR repete.
