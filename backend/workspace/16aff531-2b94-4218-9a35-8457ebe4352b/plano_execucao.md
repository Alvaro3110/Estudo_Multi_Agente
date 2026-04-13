1. **Coleta de Dados**:
   - Identificar as tabelas relevantes:
     - `vendas`: contém informações sobre transações de vendas, incluindo região, produto, quantidade e valor.
     - `custos`: contém informações sobre custos de produtos, incluindo custo por produto e região.
     - `metas_vendas`: contém informações sobre as metas de vendas por região e produto.
   
2. **Preparação dos Dados**:
   - Realizar uma junção (JOIN) entre as tabelas `vendas` e `custos` com base no ID do produto e região.
   - Calcular a margem de lucro para cada produto: `margem_lucro = (valor_venda - custo) / valor_venda`.
   - Filtrar os dados para incluir apenas as regiões Sudeste, focando em São Paulo e Rio de Janeiro.

3. **Análise de Desempenho**:
   - Agregar os dados por região e calcular:
     - Total de vendas
     - Total de custos
     - Margem de lucro média
     - Comparação com as metas de vendas: `desempenho = (total_vendas / meta_vendas) * 100`.
   
4. **Geração do Relatório**:
   - Criar visualizações (gráficos) para comparar as vendas, custos e margens de lucro entre São Paulo e Rio de Janeiro.
   - Incluir uma seção de análise que discuta os resultados e as implicações para a estratégia de vendas.

5. **Revisão e Apresentação**:
   - Revisar o relatório para garantir precisão e clareza.
   - Apresentar os resultados para as partes interessadas.