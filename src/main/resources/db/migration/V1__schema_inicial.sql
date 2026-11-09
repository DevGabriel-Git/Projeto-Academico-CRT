CREATE SEQUENCE usuarios_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE corretora_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE acao_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE carteira_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE historico_carteira_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE usuarios (id BIGINT PRIMARY KEY, nome VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, cpf VARCHAR(255) NOT NULL UNIQUE, senha VARCHAR(255) NOT NULL);

CREATE TABLE corretora (id BIGINT PRIMARY KEY, cnpj VARCHAR(255), razao_social VARCHAR(255), nome_fantasia VARCHAR(255), cep VARCHAR(255), logradouro VARCHAR(255), bairro VARCHAR(255), cidade VARCHAR(255), uf VARCHAR(255), validada_na_cvm BOOLEAN, data_cadastro TIMESTAMP, usuario_id BIGINT NOT NULL REFERENCES usuarios(id), UNIQUE(usuario_id, cnpj));

CREATE TABLE acao (id BIGINT PRIMARY KEY, ticker VARCHAR(255), nome_empresa VARCHAR(255), mercado VARCHAR(255), moeda VARCHAR(255), cotacao_atual NUMERIC(38,2), data_hora_cotacao TIMESTAMP, corretora_id BIGINT NOT NULL REFERENCES corretora(id), usuario_id BIGINT NOT NULL REFERENCES usuarios(id), UNIQUE(usuario_id, ticker));

CREATE TABLE carteira (id BIGINT PRIMARY KEY, corretora_id BIGINT NOT NULL REFERENCES corretora(id), acao_id BIGINT NOT NULL REFERENCES acao(id), usuario_id BIGINT NOT NULL REFERENCES usuarios(id), quantidade INTEGER CHECK (quantidade >= 0), preco_medio NUMERIC(38,2), data_atualizacao TIMESTAMP, version BIGINT DEFAULT 0, UNIQUE(usuario_id, corretora_id, acao_id));

CREATE TABLE historico_carteira (id BIGINT PRIMARY KEY, carteira_id BIGINT NOT NULL REFERENCES carteira(id), usuario_id BIGINT NOT NULL REFERENCES usuarios(id), tipo VARCHAR(255), quantidade INTEGER CHECK (quantidade > 0), preco_unitario NUMERIC(38,2), valor_total NUMERIC(38,2), data_operacao TIMESTAMP);

CREATE INDEX idx_corretora_usuario ON corretora(usuario_id);

CREATE INDEX idx_acao_usuario ON acao(usuario_id);

CREATE INDEX idx_carteira_usuario ON carteira(usuario_id);

CREATE INDEX idx_historico_usuario_carteira ON historico_carteira(usuario_id, carteira_id);
