# ESPECIFICAÇÃO DE ENDPOINTS REST API

Todos os endpoints que exigem autenticação recebem o header `Authorization: Bearer <jwt_token>`.

## 1. Autenticação & Perfil (`/api/auth`)
- `POST /api/auth/register`
  - Body: `{ username, email, password }`
  - Cria usuário, perfil, fazenda com grid 8x8 padrão, carteira inicial (500 gold, 20 gemas), inventário com sementes iniciais.
- `POST /api/auth/login`
  - Body: `{ login, password }` (login pode ser email ou username)
  - Resposta: `{ token, user, profile, wallet }`
- `GET /api/auth/me`
  - Resposta: dados completos atualizados do jogador autenticado.

## 2. Fazenda & Culturas (`/api/farm`)
- `GET /api/farm` -> Carrega o grid do jogador com cálculo em tempo real do estado de crescimento das plantas.
- `POST /api/farm/plant` -> Body: `{ tile_x, tile_y, seed_item_id }`. Valida semente no inventário, consome 1 unidade e inicia o timer no servidor.
- `POST /api/farm/water` -> Body: `{ tile_x, tile_y }`. Atualiza o estado de rega.
- `POST /api/farm/harvest` -> Body: `{ tile_x, tile_y }`. Valida se o timestamp atual >= tempo de colheita. Adiciona colheita ao inventário e concede XP.
- `POST /api/farm/expand` -> Expande o tamanho do grid mediante pagamento em moedas.

## 3. Inventário & Loja do Sistema (`/api/inventory`)
- `GET /api/inventory` -> Lista de itens e quantidades no armazém do jogador.
- `POST /api/inventory/sell` -> Venda direta ao NPC comerciante da cidade.
- `GET /api/shop/items` -> Catálogo oficial de sementes, rações e animais para compra com ouro do sistema.
- `POST /api/shop/buy` -> Compra de sementes ou insumos do sistema.

## 4. Animais (`/api/animals`)
- `GET /api/animals` -> Animais na fazenda e seu status de produção.
- `POST /api/animals/buy` -> Body: `{ animal_id, nickname }`.
- `POST /api/animals/feed` -> Body: `{ instance_id }`. Alimenta o animal consumindo ração do inventário.
- `POST /api/animals/collect` -> Body: `{ instance_id }`. Coleta ovos/leite/lã se o ciclo terminou.

## 5. Mercado Livre P2P (`/api/market`)
- `GET /api/market/listings` -> Query params: `search, category, page, limit, sort_by, order`.
- `POST /api/market/listings` -> Body: `{ item_id, quantity, unit_price }`. Bloqueia o item do inventário do vendedor e cria anúncio público.
- `POST /api/market/buy` -> Body: `{ listing_id, quantity }`. Realiza compra atômica com bloqueio de concorrência.
- `DELETE /api/market/listings/:id` -> Cancela anúncio e devolve itens restantes ao vendedor.
- `GET /api/market/history` -> Histórico recente de transações no mercado.

## 6. Social & Ranking (`/api/social`)
- `GET /api/social/leaderboard` -> Ranking dos melhores fazendeiros por nível e ouro.
- `GET /api/social/farms/:user_id` -> Visita a fazenda pública de outro jogador.

## 7. Administração (`/api/admin`)
- `GET /api/admin/metrics` -> Resumo macroeconômico, total de usuários, volume de mercado e ouro em circulação.
- `GET /api/admin/users` -> Lista de usuários com status e controles.
- `POST /api/admin/users/:id/ban` -> Congelamento ou desbloqueio de conta.
- `POST /api/admin/config` -> Ajuste da taxa de mercado ou balanceamento.
- `GET /api/admin/audit-logs` -> Consulta a eventos auditados no sistema.
