export interface Corretora {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  validadaNaCvm: boolean;
  dataCadastro: string;
  acoes: Acao[];
}

export interface Acao {
  id: number;
  ticker: string;
  nomeEmpresa: string;
  mercado: string;
  moeda: string;
  cotacaoAtual: number;
  dataHoraCotacao: string;
}

export interface Carteira {
  id: number;
  quantidade: number;
  precoMedio: number;
  dataAtualizacao: string;
  acao?: Acao;
  corretora?: Corretora;
  historico?: HistoricoCarteira[];
}

export interface HistoricoCarteira {
  id: number;
  tipo: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  dataOperacao: string;
}

export interface OperacaoDTO {
  corretoraId: number;
  acaoId: number;
  tipo: string;
  quantidade: number;
  precoUnitario: number;
}
