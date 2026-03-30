SELECT 
    SUM(total_amount) AS total_sales,
    COUNT(DISTINCT customer_id) AS unique_customers,
    AVG(quantity) AS average_quantity_per_transaction,
    COUNT(transaction_id) AS total_transactions,
    region
FROM 
    estudo_multi_agente.bronze.sales_transactions
WHERE 
    region = 'SP'
GROUP BY 
    region
ORDER BY 
    total_sales DESC;