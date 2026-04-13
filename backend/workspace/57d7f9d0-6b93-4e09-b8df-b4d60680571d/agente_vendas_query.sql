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
    p.price,
    p.cost,
    (st.total_amount - (p.cost * st.quantity)) AS profit_margin
FROM 
    estudo_multi_agente.bronze.sales_transactions st
JOIN 
    estudo_multi_agente.bronze.products p ON st.product_id = p.product_id
WHERE 
    p.category = 'eletronicos' 
    AND st.region IN ('SP', 'RJ')
ORDER BY 
    st.transaction_date;