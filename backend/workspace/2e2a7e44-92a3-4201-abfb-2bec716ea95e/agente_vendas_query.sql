SELECT 
    p.product_name,
    p.category,
    st.region,
    SUM(st.quantity) AS total_quantity_sold,
    SUM(st.total_amount) AS total_sales,
    SUM(st.total_amount) - SUM(st.quantity * p.cost) AS total_profit,
    (SUM(st.total_amount) - SUM(st.quantity * p.cost)) / SUM(st.total_amount) * 100 AS profit_margin
FROM 
    estudo_multi_agente.bronze.sales_transactions st
JOIN 
    estudo_multi_agente.bronze.products p ON st.product_id = p.product_id
WHERE 
    p.category = 'eletronicos' 
    AND st.region IN ('SP', 'RJ')
GROUP BY 
    p.product_name, p.category, st.region
ORDER BY 
    st.region, total_sales DESC;