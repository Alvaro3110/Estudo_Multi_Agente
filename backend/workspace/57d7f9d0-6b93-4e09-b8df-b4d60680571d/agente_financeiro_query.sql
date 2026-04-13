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
    (st.total_amount - (st.quantity * st.unit_price)) AS margin
FROM 
    estudo_multi_agente.bronze.sales_transactions AS st
WHERE 
    st.region IN ('SP', 'RJ')
    AND st.product_id IN (SELECT product_id FROM estudo_multi_agente.bronze.financials)
ORDER BY 
    st.region, st.transaction_date;