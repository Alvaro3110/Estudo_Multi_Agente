SELECT 
    SUM(st.total_amount) AS total_sales,
    COUNT(DISTINCT st.transaction_id) AS total_transactions,
    COUNT(DISTINCT st.customer_id) AS total_customers,
    SUM(pr.price) AS total_stock_value,
    COUNT(DISTINCT pr.product_id) AS total_products
FROM 
    estudo_multi_agente.bronze.sales_transactions st
JOIN 
    estudo_multi_agente.bronze.products pr ON st.product_id = pr.product_id
WHERE 
    st.region = 'SP'