SELECT 
    SUM(total_amount) AS total_sales,
    COUNT(transaction_id) AS total_transactions,
    DATE(transaction_date) AS sales_date
FROM 
    estudo_multi_agente.bronze.sales_transactions
WHERE 
    region = 'SP' 
    AND transaction_date = CURRENT_DATE
GROUP BY 
    DATE(transaction_date)

UNION ALL

SELECT 
    SUM(total_amount) AS total_sales,
    COUNT(transaction_id) AS total_transactions,
    DATE(transaction_date) AS sales_date
FROM 
    estudo_multi_agente.bronze.sales_transactions
WHERE 
    region = 'SP' 
    AND transaction_date < CURRENT_DATE
GROUP BY 
    DATE(transaction_date)
ORDER BY 
    sales_date DESC;