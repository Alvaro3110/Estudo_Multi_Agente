SELECT 
    f.transaction_id, 
    f.customer_id, 
    f.product_id, 
    s.quantity, 
    s.unit_price, 
    s.total_amount, 
    s.transaction_date, 
    s.channel, 
    s.region, 
    f.cost, 
    f.margin, 
    f.payment_method, 
    f.installment_band, 
    f.margin_band, 
    f.fraud_flag 
FROM 
    estudo_multi_agente.bronze.sales_transactions s
JOIN 
    estudo_multi_agente.bronze.financials f 
ON 
    s.transaction_id = f.transaction_id 
WHERE 
    s.region = 'SP';