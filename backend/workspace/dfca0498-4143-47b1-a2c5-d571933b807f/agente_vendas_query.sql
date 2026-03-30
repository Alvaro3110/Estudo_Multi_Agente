SELECT 
    p.category,
    SUM(st.total_amount) AS total_sales
FROM 
    estudo_multi_agente.bronze.sales_transactions st
JOIN 
    estudo_multi_agente.bronze.products p ON st.product_id = p.product_id
WHERE 
    st.region = 'SP' 
    AND st.transaction_date >= DATEADD(quarter, -1, CURRENT_DATE)
GROUP BY 
    p.category
ORDER BY 
    total_sales DESC;