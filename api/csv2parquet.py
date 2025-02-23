import polars as pl

lf = pl.scan_csv("../data.csv")

lf.sink_parquet("../data.parquet", compression="zstd")
