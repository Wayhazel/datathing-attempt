import polars as pl
pl.Config.set_fmt_str_lengths(100)
pl.Config.set_tbl_rows(-1)
df = pl.scan_parquet("../data.parquet")

print(
    df.select("LAT", "LON").sort("LAT", descending=True).limit(5).collect()
)

print(
    df.select("LAT", "LON").sort("LON", descending=True).filter(pl.col("LON") != 0).limit(5).collect()
)