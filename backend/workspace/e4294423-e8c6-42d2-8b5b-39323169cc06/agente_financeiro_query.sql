SELECT 
    st.transaction_id,
    st.customer_id,
    st.product_id,
    st.quantity,
    st.unit_price,
    st.total_amount,
    st.transaction_date,
    st.channel,
    st.region,
    f.cost,
    f.margin,
    f.payment_method,
    f.installment_band,
    f.margin_band,
    f.fraud_flag
FROM 
    estudo_multi_agente.bronze.sales_transactions st
JOIN 
    estudo_multi_agente.bronze.financials f ON st.transaction_id = f.transaction_id
WHERE 
    st.region = 'SP' OR st.region = 'RJ'
    AND st.product_id IN ('P863', 'P225', 'P129', 'P927', 'P237')
ORDER BY 
    st.transaction_date;