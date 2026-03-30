SELECT 
    SUM(total_amount) AS total_sales,
    COUNT(transaction_id) AS total_transactions,
    COUNT(DISTINCT customer_id) AS unique_customers,
    SUM(quantity) AS total_quantity_sold
FROM 
    estudo_multi_agente.bronze.sales_transactions
WHERE 
    region = 'SP'