SELECT region, SUM(total_amount) AS total_sales, SUM(quantity * unit_price) AS total_profit
FROM estudo_multi_agente.bronze.sales_transactions
WHERE region IN ('SP', 'RJ') AND product_id IN (
    SELECT product_id 
    FROM estudo_multi_agente.bronze.products 
    WHERE category = 'eletronicos'
)
GROUP BY region
ORDER BY total_sales DESC;