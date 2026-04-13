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
    (st.total_amount - p.cost * st.quantity) AS profit_margin
FROM 
    estudo_multi_agente.bronze.sales_transactions st
JOIN 
    estudo_multi_agente.bronze.products p ON st.product_id = p.product_id
WHERE 
    p.category = 'eletronicos' 
    AND st.region = 'SP'
ORDER BY 
    st.transaction_date;

WITH sales_sp AS (
    SELECT 
        SUM(st.total_amount) AS total_sales_sp,
        SUM(st.quantity) AS total_quantity_sp
    FROM 
        estudo_multi_agente.bronze.sales_transactions st
    WHERE 
        st.region = 'SP'
),
sales_rj AS (
    SELECT 
        SUM(st.total_amount) AS total_sales_rj,
        SUM(st.quantity) AS total_quantity_rj
    FROM 
        estudo_multi_agente.bronze.sales_transactions st
    WHERE 
        st.region = 'RJ'
)
SELECT 
    sp.total_sales_sp,
    sp.total_quantity_sp,
    rj.total_sales_rj,
    rj.total_quantity_rj
FROM 
    sales_sp sp, sales_rj rj;