## get datasets
Crime_Data_from_2020_to_Present <- read.csv("~/Downloads/RDirectories/Datathon/Crime_Data_from_2020_to_Present.csv", header=FALSE)

## load libraries
pacman::p_load(graph3d, plot3D, png, rgl, car, ggmap, plotly, ggplot2, dplyr, ggpubr, jpeg)

##  Get data:
x <- Crime_Data_from_2020_to_Present$V27
x <- x[-c(1)]
x <- x[x != 0]
x <- as.numeric(x)
min(x)
max(x)
x <- as.numeric(x) - 34
y <- Crime_Data_from_2020_to_Present$V28
y <- y[-c(1)]
y <- y[y != 0]
y <- as.numeric(y)
min(y)
max(y)
y <- as.numeric(y) + 118

##  Create cuts:
x_c <- cut(x, breaks = seq(33.7059-34, 0.3343, length = 50))
y_c <- cut(y, breaks = seq(-0.6676, -0.1554, length = 50))

##  Calculate joint counts at cut levels:
z <- table(x_c, y_c)

##  Create data frame using the table z, and revalue column values to be integers rather than factors
zData <- as.data.frame(z) 
colnames(zData) <- c("x", "y", "z")
zData$x <- rep(((seq(33.7059-34, 0.3343, length = 50)+34)[c(-1)] + (seq(33.7059-34, 0.3343, length = 50)+34)[c(-50)])/2, times = 49)
zData$y <- rep(((seq(-0.6676, -0.1554, length = 50)-118)[c(-1)] + (seq(-0.6676, -0.1554, length = 50)-118)[c(-50)])/2, each = 49)
zData = zData[(zData[3])>0,] 

## plot as 3d histogram
graph3d(data = zData, type = "bar", zMin = 0, tooltip = TRUE,
        xBarWidth = 0.01, yBarWidth = 0.01,
        xlab = "Latitude", ylab = "Longitude", zlab = "Number of Crime", 
        showAnimationControls = TRUE)


## plot as 2d scatter plot
ggplot(Crime_Data_from_2020_to_Present, aes(V28, V27)) +
  geom_tile()
