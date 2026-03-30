SELECT 
    SUM(quantity) AS total_sales_volume,
    (SUM(quantity) - LAG(SUM(quantity)) OVER (ORDER BY transaction_date)) / NULLIF(LAG(SUM(quantity)) OVER (ORDER BY transaction_date), 0) * 100 AS sales_growth_percentage,
    transaction_date
FROM 
    estudo_multi_agente.bronze.sales_transactions
WHERE 
    channel = 'Varejo Digital' AND 
    region = 'SP'
GROUP BY 
    transaction_date
ORDER BY 
    transaction_date;