SELECT 
    region,
    product_id,
    SUM(quantity) AS total_quantity,
    SUM(total_amount) AS total_sales,
    AVG(unit_price) AS average_price,
    SUM(margin) AS total_margin
FROM 
    estudo_multi_agente.bronze.sales_transactions
WHERE 
    region IN ('SP', 'RJ')
GROUP BY 
    region, product_id
ORDER BY 
    region, total_sales DESC;