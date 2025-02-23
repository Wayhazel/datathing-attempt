import polars as pl
from crimes import CrimesMap

lf = pl.scan_csv("../data.csv")

codes = list(lf.select("Crm Cd").collect().to_dict(as_series=False).values())[0]

types = [CrimesMap[code] for code in codes]

typelf = pl.from_dict({"CrimeType": types}).lazy()

lf = pl.concat([lf, typelf], how="horizontal").collect()

lf.write_parquet("../data.parquet", compression="zstd")
