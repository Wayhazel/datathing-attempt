import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature

minlon = -118.6676
minlat = 33.7059
maxlon = -118.1554
maxlat = 34.3343

# Create a figure with a specified projection
fig, ax = plt.subplots(figsize=(8, 6), subplot_kw={'projection': ccrs.PlateCarree()})

# Set map extent to focus on Los Angeles
ax.set_extent([minlon, maxlon, minlat, maxlat])

# Add features (coastline, borders, etc.)
ax.add_feature(cfeature.COASTLINE)
ax.add_feature(cfeature.BORDERS, linestyle=':')
ax.add_feature(cfeature.LAND, facecolor='lightgray')
ax.add_feature(cfeature.OCEAN, facecolor='lightblue')

# Add gridlines with labels
gl = ax.gridlines(draw_labels=True, linestyle="--", alpha=0.5)
gl.top_labels = False   # Hide top labels
gl.right_labels = False # Hide right labels

# Add title
ax.set_title("Map of Los Angeles with Latitude and Longitude")

plt.savefig("los_angeles_map.png", bbox_inches='tight', dpi=1000)