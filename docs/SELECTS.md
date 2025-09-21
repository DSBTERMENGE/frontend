ESTRATÉGIA PARA SELECTS:
Objetivos das selects: As selects tem o objetivo de exbir com facilidade um registro ou um bloco de registros que obedeçam a um critério.
SELECTS DE NAVEGAÇÃO:
A select que exibe um registro por regra, são usadas para navegação precisa e rápida, imagina em um banco de dados de 10000 alunos encontrar um determinado aluno navegando registro por registro.

Em uma consulta de mil registros e uma select para navegação, esta irá informar o id do registro selecionado pelo usuário e o sistema solicitará a população do formulário com o registro referente aquele id, podendo o usuário depois se quiser navegar com os botões ou selecionar de novo outro registro, para continuar seu estudo.


SELECTS DE FILTRO:
Select que exibe um grupo de registros, lembrando que o grupo poderá ter vários, um ou nenhum registro a depender do filtro aplicado.
Criaremos.
Aqui temos um problema pois dependendo do tamanho do banco de dados como vimos um filtro pode retornar de 0 a milhares de registros, vamos suporte um banco de dados com os estudantes de contabilidade listados por estado, municipio e bairro do Brasil.
Sugiria a necessidade de uma select de navegação além da select de filtro.

POPULAÇÃO DE SELECTS E FORMULÁRIOS:
1 - SELECT DE NAVEGAÇÃO:
- Esta select seria propulada usando campo do mesmo conjunto de dados usado para popular o formulário, e posteriormente ao responde o seu evento se popularia de novo o formulário com o indice do registro correspondente.
Após popular a Select a mesma exibirá o  primeiro valor da lista e o formulário exibirá o registro correspondente que obviamente também será o primeiro da lista.

2 - SELECT DE FILTROS:
- Esta select geralmente utilizada para tabelas relacionadas será usada com dados da tabela Pai para retorna dados de uma tabela filha ou view.
Estas selects poderã ser mais de uma , ou seja trabalhando em cascata.
- Será aplicado automaticamente o filtro referente as seleções das sects que sempre no momento inicial será a primeira opção de cada select.
- Este conjunto de registros, caso tenha sido retornado algum, servirá para popular uma select de navegação e a seguir o formulário com o primeiro registro da lista.

3 ORDEM DE EXECUÇÃO:
Deverão ser populadas as selects primeiro e depois ser populado o formulário.
Em caso de mais de uma Select o clique em uma anterior à última disparará em cascata a repopulação das demais até a ultima e por fim o formulário, obedencendo os critérios anteriores.


PARA DOIS BLOCOS SEPARADOS, VOCÊ PRECISARIA:
OPÇÃO 1: DUAS INSTÂNCIAS  Exemplo abaixo:

// Bloco 1: Selects de filtro (Estado, Município, Bairro)
const selectsFiltro = new CriarSelects(
    ['Estado', 'Município', 'Bairro'],
    ['estado', 'municipio', 'bairro'], 
    ['120px', '150px', '150px']
);

// Bloco 2: Select de navegação (Pessoas filtradas)
const selectNavegacao = new CriarSelects(
    ['Pessoa'],
    ['pessoa'],
    ['300px']
);
