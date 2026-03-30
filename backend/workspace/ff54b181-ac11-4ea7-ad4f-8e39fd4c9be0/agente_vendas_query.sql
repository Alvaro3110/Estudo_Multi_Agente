SELECT 
    st.transaction_date,
    COUNT(DISTINCT st.customer_id) AS total_customers,
    SUM(st.quantity) AS total_quantity_sold,
    SUM(st.total_amount) AS total_sales,
    AVG(st.unit_price) AS average_unit_price,
    p.category,
    p.brand,
    COUNT(DISTINCT st.product_id) AS total_products_sold
FROM 
    estudo_multi_agente.bronze.sales_transactions st
JOIN 
    estudo_multi_agente.bronze.products p ON st.product_id = p.product_id
WHERE 
    st.region = 'SP'
GROUP BY 
    st.transaction_date, p.category, p.brand
ORDER BY 
    st.transaction_date;