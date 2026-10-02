# AUDITORIA E DIRETRIZES DE SEGURANÇA

## 1. Proteção de Transações e Concorrência (Race Conditions)
- Compras no marketplace usam transações PostgreSQL no modo `READ COMMITTED` ou superior com trava explícita:
  ```sql
  SELECT * FROM market_listings WHERE id = $1 AND status = 'active' FOR UPDATE;
  ```
  Isso garante que solicitações simultâneas de compra para a mesma listagem entrem em fila, prevenindo venda dupla ou itens fantasmas.

## 2. Server Authority & Anti-Tampering
- O frontend nunca informa preços ou quantidades finais calculadas para execução no banco.
- O tempo de crescimento de culturas é calculado exclusivamente pelo delta `EXTRACT(EPOCH FROM (NOW() - planted_at))` no PostgreSQL.
- Saldos de carteira são alterados exclusivamente por operações atômicas com verificação de restrição `gold_coins >= amount`.

## 3. Autenticação e Sanitização
- Senhas hasheadas com `bcrypt` (10 rounds).
- Tokens JWT assinados com chave secreta e expiração curta (24 horas).
- Validação estrita de schemas com sanitização para prevenção de XSS e SQL Injection com queries parametrizadas.
- Rate limiting por IP e por usuário em rotas críticas (login, plantio, mercado).
