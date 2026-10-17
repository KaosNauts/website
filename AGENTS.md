# Publicação do website

Regra explícita de Ian, registrada em 2026-10-17, para `KaosNauts/website`:

- **Nunca criar pull request para este repositório.** Alterações autorizadas do
  website devem ser commitadas e enviadas diretamente para `main`.
- Esta é uma exceção específica ao fluxo de PR do workspace. Não estender esta
  regra aos repositórios `kaosnauts-game` ou `kaosnauts-resource`.
- Antes de editar ou publicar, conferir branch, status, remotes e diffs; preservar
  alterações alheias e atualizar a `main` somente por fast-forward. Nunca forçar
  push nem descartar trabalho para publicar.
- Validar as mudanças pertinentes antes do push. Para markup ou traduções, gerar
  as páginas com `node scripts/build-site.mjs` e conferir com
  `node scripts/build-site.mjs --check` e `node scripts/check-site.mjs`.
- O push para `main` aciona a publicação já existente do GitHub Pages. Não criar
  CI ou alterar workflows como efeito colateral de uma mudança no website.
