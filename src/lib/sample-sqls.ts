import type { SqlDialect } from "@/types/graph";

export interface SampleSql {
  label: string;
  engine: SqlDialect | "auto";
  sql: string;
}

export const SAMPLE_SQLS: SampleSql[] = [
  {
    label: "MySQL - 近30天品类销售Top10",
    engine: "mysql",
    sql: `SELECT\noi.category,\nSUM(oi.amount) AS total_sales,\nCOUNT(DISTINCT o.order_id) AS order_count\nFROM orders o\nINNER JOIN order_items oi ON o.order_id = oi.order_id\nLEFT JOIN customers c ON o.customer_id = c.id\nWHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\nAND o.status = 'completed'\nGROUP BY oi.category\nHAVING total_sales > 1000\nORDER BY total_sales DESC\nLIMIT 10`,
  },
  {
    label: "Presto - JSON解析+窗口函数",
    engine: "presto",
    sql: `WITH user_orders AS (\nSELECT\nuser_id,\njson_extract_scalar(order_info, '$.product') AS product,\nCAST(json_extract(order_info, '$.price') AS DOUBLE) AS price,\norder_date\nFROM catalog.schema.raw_orders\nWHERE dt = '2026-05-26'\n)\nSELECT\nproduct,\nuser_id,\nprice,\nROW_NUMBER() OVER (PARTITION BY product ORDER BY price DESC) AS rank,\nAVG(price) OVER (PARTITION BY product) AS avg_price\nFROM user_orders\nQUALIFY rank <= 5\nORDER BY product, rank`,
  },
  {
    label: "Hive - 侧视图展开+分区",
    engine: "hive",
    sql: `SELECT\ntag,\nCOUNT(DISTINCT user_id) AS uv,\nAVG(session_duration) AS avg_duration\nFROM user_behavior\nLATERAL VIEW EXPLODE(SPLIT(tags, ',')) t AS tag\nWHERE dt >= '2026-05-01'\nAND event_type = 'page_view'\nGROUP BY tag\nHAVING uv > 100\nORDER BY uv DESC`,
  },
  {
    label: "Spark - CTE+多表JOIN",
    engine: "spark",
    sql: `WITH daily_stats AS (\nSELECT\nproduct_id,\nDATE_TRUNC('day', sale_time) AS sale_day,\nSUM(quantity) AS total_qty,\nSUM(quantity * unit_price) AS revenue\nFROM sales\nWHERE sale_time >= CURRENT_DATE - INTERVAL 7 DAYS\nGROUP BY product_id, DATE_TRUNC('day', sale_time)\n),\nproduct_info AS (\nSELECT\nid,\nname,\ncategory,\nsupplier_id\nFROM products\nWHERE is_active = TRUE\n)\nSELECT\np.category,\np.name,\nds.sale_day,\nds.revenue,\nRANK() OVER (PARTITION BY p.category ORDER BY ds.revenue DESC) AS revenue_rank\nFROM daily_stats ds\nINNER JOIN product_info p ON ds.product_id = p.id\nORDER BY p.category, ds.sale_day`,
  },
  {
    label: "PostgreSQL - 窗口函数+CTE",
    engine: "pg",
    sql: `WITH monthly_revenue AS (\nSELECT\nDATE_TRUNC('month', created_at)::DATE AS month,\nregion,\nSUM(amount) AS total_revenue,\nCOUNT(*) AS transaction_count\nFROM transactions\nWHERE created_at >= CURRENT_DATE - INTERVAL '12 months'\nAND status = 'success'\nGROUP BY DATE_TRUNC('month', created_at)::DATE, region\n)\nSELECT\nmonth,\nregion,\ntotal_revenue,\nLAG(total_revenue, 1) OVER (PARTITION BY region ORDER BY month) AS prev_month_revenue,\nROUND(\n(total_revenue - LAG(total_revenue, 1) OVER (PARTITION BY region ORDER BY month))\n/ NULLIF(LAG(total_revenue, 1) OVER (PARTITION BY region ORDER BY month), 0) * 100,\n2\n) AS mom_growth_pct\nFROM monthly_revenue\nORDER BY region, month`,
  },
];
