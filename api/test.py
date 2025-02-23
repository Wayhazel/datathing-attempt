import polars as pl
from crimes import CrimesMap

pl.Config.set_fmt_str_lengths(100)
pl.Config.set_tbl_rows(-1)
df = pl.scan_parquet("../data.parquet")

"""
# Shows number of different crimes
print(
    df.group_by("Crm Cd Desc")
    .agg(pl.struct("Crm Cd", "DR_NO").n_unique().alias("result"))
    .sort("result", descending=True)
    .collect()
)
"""

print(df.select("Crm Cd", "Crm Cd Desc").unique().sort("Crm Cd").collect())


# Test our map
'''
codes = list(df.select("Crm Cd").collect().to_dict(as_series=False).values())[0]
print(len(codes))

types = [CrimesMap[code] for code in codes]

typedf = pl.from_dict({"CrimeType": types}).lazy()

df = pl.concat([df, typedf], how="horizontal")
'''

print(df.select("CrimeType", "Crm Cd", "Crm Cd Desc", "TIME OCC").limit(100).collect())
