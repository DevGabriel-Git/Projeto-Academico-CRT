# ADR 003 — Ferramentas do curso e observabilidade
Data: 2026-11-05. Decisao: manter ferramentas em .tools ignorado, versoes/proveniencia em tools/versions.json e skills-lock.json; nao instalar globalmente na maquina.
Alternativas: depender das versoes globais; usar somente Docker; ferramentas locais verificadas.
Escolha: locais, pois o daemon Docker nao esta ativo e o curso exige verificacao reproduzivel. Os wrappers tambem aceitam executaveis instalados no PATH para CI/Linux.
Boot 4 usa spring-boot-starter-opentelemetry e management.opentelemetry.tracing.export.otlp.endpoint. JDBC usa datasource-micrometer 2.0.1, publicado contra Boot 4.0.0. Exportacao e ativada pelo perfil observability; producao amostra 10% por padrao.
Nao prometer ganho de latencia: o smoke mede uma versao/dataset local. Comparacao antes/depois exige baseline adicional.
O kit OMP/Spec Kit foi instalado para uso prospectivo. Nao comprova TDD retroativo nem aprendizado do aluno.
