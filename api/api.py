from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

import polars as pl


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (definitely insecure)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

df = pl.scan_parquet("../data.parquet")


@app.get("/query")
async def query(
    limit: int = 10,
    columns: str = None,
    filter_col: str = None,
    filter_value: str = None
):
    query = df
    
    if columns:
        col_list = [col.strip() for col in columns.split(",")]
        query = query.select(col_list)
    
    if filter_col and filter_value:
        query = query.filter(pl.col(filter_col) == filter_value)
    
    query = query.limit(limit)

    return {"message": query.collect().to_dict(as_series=False)}


@app.get("/height/{lamin}/{lamax}/{lomin}/{lomax}")
async def height(lamin: float, lamax: float, lomin: float, lomax: float):
    query = df
    result = len(
        query.filter(
            (pl.col("LAT").is_between(lamin, lamax))
            & (pl.col("LON").is_between(lomin, lomax))
        )
        .collect()
    )
    return result
