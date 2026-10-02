# GAME.MD — ESPECIFICAÇÃO MESTRE: COLHEITA DOS SONHOS (HARVEST HORIZON)

## 1. Visão Geral
**Colheita dos Sonhos** é um jogo online persistente de simulação e economia de fazenda multiplayer com forte apelo social e mercado dinâmico entre jogadores (Player-to-Player).

O jogo combina:
- Gestão tática de fazenda (plantio, ciclos de rega, animais, melhorias de terreno).
- Economia dinâmica transparente com autoridade 100% no servidor.
- Marketplace global com concorrência ACID protegida contra *race conditions*.
- Camada social de visitas com inspeção de fazendas e ranking de produtores.
- Painel administrativo e governança econômica em tempo real.

---

## 2. Princípios Inegociáveis de Engenharia
1. **Server Authority (Autoridade Absoluta do Servidor):**
   - O cliente (frontend) é apenas uma camada de visualização e envio de intenções do jogador.
   - Todo cálculo de crescimento, saldos, preços, disponibilidade de itens, produção e permissões é validado e processado no backend.
   - Qualquer discrepância de tempo do navegador é desconsiderada. Timestamps do PostgreSQL e do servidor são a única fonte de verdade.

2. **Integridade Econômica e Transações ACID:**
   - Compras no mercado entre jogadores utilizam bloqueios transacionais com `SELECT ... FOR UPDATE` no PostgreSQL para prevenir que dois jogadores comprem o mesmo item simultaneamente.
   - Todo ganho ou débito de moedas (Ouro e Gemas) gera um registro imutável em `wallet_transactions` e `audit_logs`.

3. **Arquitetura Visual Awwwards-Tier:**
   - Respeito estrito ao Pacto de Excelência em UI/UX:
     - Zero emojis como ícones: exclusivamente ícones SVG precisos com traço fino (`lucide-react`).
     - Tipografia refinada (*Plus Jakarta Sans* / *Inter*).
     - Componentes com micro-bordas translúcidas, double-bezel e feedback tátil elástico.
     - Sprites originais 2D SVG vetoriais com paleta orgânica elegante e alta consistência visual.

---

## 3. Estrutura do Sistema de Culturas & Tempo
Cada cultura possui ciclos definidos em segundos no banco de dados (`crops`):
- **Trigo Dourado:** 30s de ciclo (cultura introdutória rápida)
- **Cenoura Doce:** 60s de ciclo
- **Tomate Carmim:** 120s de ciclo
- **Milho Solar:** 300s de ciclo
- **Morango Rubi:** 600s de ciclo
- **Abóbora Imperial:** 1200s de ciclo

Estados de um canteiro:
1. `empty` (solo arado pronto)
2. `planted` (semente germinando)
3. `growing` (planta crescendo, regada)
4. `ready` (pronta para colheita)
5. `withered` (opcionalmente murcha após negligência prolongada)

---

## 4. Animais e Produção Contínua
- **Galinha Caipira:** Produz *Ovo Fresco* a cada 90s após alimentada com ração vegetal.
- **Vaca Leiteira:** Produz *Leite Puro* a cada 180s após alimentada com feno/milho.
- **Ovelha Algodão:** Produz *Lã Nobre* a cada 360s após alimentada.

---

## 5. Mercado Livre P2P (Marketplace)
- Anúncios criados com preço unitário e quantidade.
- Taxa de mercado parametrizada (default: 8%), recolhida no momento da venda e direcionada ao *sink* econômico para controle de inflação.
- Histórico completo de transações gravado com comprador, vendedor, preço, taxa e timestamp.

---

## 6. Governança e Administração
- Papéis de usuário: `player` e `admin`.
- Painel para acompanhamento de usuários, congelamento de contas, ajuste de taxa de mercado, monitoramento de métricas macroeconômicas (ouro emitido vs ouro drenado) e logs de auditoria.
