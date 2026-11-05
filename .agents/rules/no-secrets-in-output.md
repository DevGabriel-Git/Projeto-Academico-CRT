---
description: Interrompe o agente se ele reproduzir um segredo (chave, token, senha) em texto ou em arquivo
condition: 'AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,}|(password|senha|secret|token)[ \t]*[:=][ \t]*(?!\$\{|\[SEGREDO)["'']?[^\s"'']{6,}'
scope: [text, tool]
---
Você está prestes a reproduzir o que parece ser um segredo. Nunca copie credenciais em respostas, relatórios de revisão ou arquivos.
Substitua pelo marcador [SEGREDO REMOVIDO], informe o arquivo e a linha, e recomende revogar a credencial e usar variável de ambiente ou cofre de segredos.
