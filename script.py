import sys
import numpy as np
import base64
from sklearn.cluster import KMeans
from io import BytesIO
from PIL import Image

def colorPalette(base64Image):
    image_data = base64.b64decode(base64Image)
    image = Image.open(BytesIO(image_data))
    image = np.array(image)
      
    pixels = image.reshape(-1, 3)
    kmeans = KMeans(n_clusters=10)
    kmeans.fit(pixels)
   
    dominant_colors = kmeans.cluster_centers_
    dominant_colors = np.round(dominant_colors).astype(int)
    print(dominant_colors)
    sys.stdout.flush()

if __name__ == '__main__':
    base64Image = sys.stdin.read().strip()

    colorPalette(base64Image)
