# Colheita dos Sonhos — Jogo Social de Fazenda Online Completo

Jogo de navegador multiplayer/social de gerenciamento de fazenda e economia P2P persistente, inspirado no clássico estilo de Colheita Feliz e FarmVille, com **código, regras, arquitetura, mecânicas e sprites 100% originais**.

---

## 🌟 Principais Funcionalidades

1. **Autenticação & Contas:**
   - Cadastro, Login com hash Bcrypt e autorização JWT Bearer.
   - Perfil de jogador com níveis, XP, avatar e títulos.
   - Sistema de permissões (`player` e `admin`) e congelamento de contas.

2. **Fazenda & Culturas (Autoridade Temporal do Servidor):**
   - Grid 6x6 persistido em PostgreSQL (`farms`, `farm_tiles`).
   - Canteiros de solo arado e áreas gramadas aráveis com ferramenta Enxada.
   - Ciclos de plantio e crescimento calculados com `NOW()` e timestamps no banco (imune a cheats de relógio local).
   - Culturas originais: Trigo Solar, Cenoura Doce, Tomate Carmim, Milho Solar e Morango Rubi.
   - Colheita atômica com rendimento determinístico, XP, subida de nível e celebração visual.

3. **Criação de Animais & Produção:**
   - Galinha Carijó (produção de Ovos Caipiras a cada 90s).
   - Vaca Holandesa (produção de Leite Integral a cada 180s).
   - Ovelha Merino (produção de Novelo de Lã Nobre a cada 360s).
   - Ciclo de alimentação com rações específicas consumidas do inventário e timers de produção em tempo real.

4. **Armazém & Inventário Persistente:**
   - Categorias: Sementes, Colheitas, Produtos Animais e Rações.
   - Venda direta ao NPC comerciante da cidade com crédito auditado em moedas de ouro.

5. **Mercado Global P2P (Marketplace Concorrente com Locks ACID):**
   - Criação de anúncios livres pelos jogadores com preço e quantidade estipulados.
   - Compra atômica protegida contra *race conditions* via `SELECT ... FOR UPDATE` no PostgreSQL (testado concorrentemente).
   - Cobrança de taxa de corretagem (padrão 8%) configurável pelo painel administrativo, agindo como *sink* de ouro contra inflação.
   - Cancelamento seguro de anúncios com devolução imediata ao armazém do vendedor.
   - Histórico público de transações com transparência total.

6. **Camada Social & Missões:**
   - Ranking Global dos maiores fazendeiros do servidor ordenados por nível, XP e fortuna em ouro.
   - Visitas a fazendas de outros jogadores para inspeção pública do terreno, culturas e criações.
   - Missões diárias de plantio, colheita, alimentação e comércio com resgate de ouro e XP.

7. **Painel Administrativo & Governança Macroeconômica:**
   - Monitoramento em tempo real: total de usuários, massa monetária em circulação, volume negociado no mercado P2P e taxas recolhidas.
   - Calibração ao vivo da taxa de corretagem do mercado com registro imutável em `audit_logs`.
   - Moderação e suspensão de jogadores.

8. **Pacto de Excelência UI/UX (Awwwards-Tier):**
   - Zero emojis como ícones: 100% ícones SVG finos via `lucide-react`.
   - Floating Island Navigation em pílula de vidro fosco.
   - Arquitetura de componentes Double-Bezel (Doppelrand).
   - Tipografia moderna (*Plus Jakarta Sans* e *Inter*).
   - Sprites 2D vetoriais originais SVG sem ativos externos proprietários.

---

## 🚀 Como Executar

### 1. Pré-Requisitos
- **Node.js** (v18+)
- **PostgreSQL** (v14+ com banco de dados `colheita_game` criado)

### 2. Configurar o Banco de Dados
```bash
# Executar as migrações e seeds no PostgreSQL
psql -U postgres -d colheita_game -f database/schema.sql
psql -U postgres -d colheita_game -f database/seed.sql
```

### 3. Iniciar o Backend
```bash
cd backend
npm install
npm run dev
```
O servidor estará rodando em `http://localhost:4000`.

### 4. Iniciar o Frontend
```bash
cd frontend
npm install
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.

---

## 🧪 Testes Automatizados

O backend conta com suíte de testes com Vitest cobrindo autenticação, integridade do inventário, validação temporal de colheitas e **concorrência no marketplace (Cenário A)**:
```bash
cd backend
npm test
```
Resultados:
- ✅ Cadastro concede saldo inicial e sementes no inventário
- ✅ Fazenda é inicializada com tiles e plantio consome semente
- ✅ Compra na loja debita ouro e concede item no inventário
- ✅ Cenário A: Concorrência no Marketplace com bloqueio transacional (SELECT FOR UPDATE)
- ✅ Tentativa de vender item inexistente rejeitada pelo servidor

---

## 📂 Estrutura de Diretórios
```
├── /backend          # Servidor Node.js, Express, PostgreSQL Pool, Módulos REST
│   └── /src
│       ├── /config   # Conexão db.ts, variáveis de ambiente env.ts
│       ├── /modules  # auth, farm, inventory, wallet, animals, market, missions, social, admin
│       └── /tests    # Suíte de testes com vitest
├── /frontend         # Aplicação React 19, Vite, Tailwind CSS, Lucide React
│   └── /src
│       ├── /components  # sprites, farm, common, inventory, shop, animals, market, missions, etc.
│       ├── /context     # AuthContext.tsx
│       └── /pages       # AuthPage.tsx, GameDashboard.tsx
├── /database         # schema.sql, seed.sql
├── /shared           # types.ts (contratos de dados compartilhados)
├── /docs             # ARCHITECTURE.md, DATABASE.md, API.md, ECONOMY.md, SECURITY.md, etc.
└── Game.md           # Especificação mestre do jogo
```
