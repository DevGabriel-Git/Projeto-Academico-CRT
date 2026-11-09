# Integridade de skills independente do sistema operacional

O PR falha no Ubuntu em scripts/check_skills.py, começando por code-review,
embora o mesmo checkout passe no Windows. sorted(Path) ordena componentes com
sensibilidade a maiúsculas no Linux e sem essa sensibilidade no Windows.

- Definir ordem explícita por componentes de caminho relativos, sem depender de
  Path.__lt__, preservando a ordem usada para produzir skills-lock.json.
- Preservar todos os hashes fixados, as origens e os bytes das skills de terceiros.
- Manter normalização CRLF/LF e detecção de arquivos ausentes ou alterados.
- Testar SKILL.md versus agents/openai.yaml, prefixos de nomes e alteração real.
- Reproduzir a falha e comprovar correção em Linux, além da execução Windows.
- Publicar a correção na branch do PR após revisão e preflight integral.
- Executar também check_skills.py no preflight, alinhando o gate local ao CI.

Evidência: teste de ordem canônica falhou em Linux antes da correção e passou
depois. Três testes de regressão e os 18 hashes originais passaram em Windows e
Linux; suíte Python completa com 24 testes aprovada. Logs em reports/skills-linux-red.log,
reports/skills-linux-green.log e reports/skills-python-tests.log. Nenhum arquivo
de skill nem entrada de skills-lock.json foi alterado.
