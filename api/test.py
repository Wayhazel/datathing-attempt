import polars as pl

pl.Config.set_fmt_str_lengths(100)
pl.Config.set_tbl_rows(-1)
df = pl.scan_parquet("../data.parquet")

print(
    df.select("Crm Cd", "Crm Cd Desc").unique().collect()
)