SELECT * FROM estudo_multi_agente.bronze.sales_transactions 
WHERE transaction_date BETWEEN CURRENT_DATE - INTERVAL '5 days' AND CURRENT_DATE 
AND region = 'SP' 
ORDER BY transaction_date;