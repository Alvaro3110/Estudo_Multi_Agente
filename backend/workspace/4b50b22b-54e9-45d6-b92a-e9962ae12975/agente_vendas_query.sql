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
    p.product_name,
    p.category,
    p.brand,
    p.price_band,
    p.lifecycle_stage
FROM 
    estudo_multi_agente.bronze.sales_transactions AS st
JOIN 
    estudo_multi_agente.bronze.products AS p
ON 
    st.product_id = p.product_id
WHERE 
    st.region = 'SP'
ORDER BY 
    st.transaction_date DESC;