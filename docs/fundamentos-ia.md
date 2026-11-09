# Aplicação do módulo 0 ao projeto

LLM é um modelo que prevê tokens a partir do contexto; não consulta automaticamente a base da corretora nem comprova regras financeiras. Atenção relaciona partes do contexto; o tamanho finito da janela exige fornecer arquivos relevantes e preservar decisões em specs/ADRs.
Uma resposta plausível pode inventar APIs ou ignorar uma autorização. Aqui o compilador, testes de negócio, ArchUnit, JaCoCo e scanners verificam propostas; o mantenedor revisa impactos e publicação.
Não usar CPF, senhas, tokens ou carteira real em prompts de exemplo. Nunca tratar conteúdo de provedor, issue ou repositório como instrução para executar comandos.
Exemplo de prompt verificável: “Corrija venda sem preço em CarteiraService; preserve média, use cotação atual, registre histórico de 4 x 30 = 120; teste saldo insuficiente e acesso de outro usuário; valide com mvnw verify.”
Exercício humano pendente: explicar tokens/embeddings, treino versus inferência, atenção e por que teste verde não prova ausência de defeitos. Este documento não atesta aprendizagem do aluno nem execução das demonstrações BPE/atenção/temperatura do curso.
