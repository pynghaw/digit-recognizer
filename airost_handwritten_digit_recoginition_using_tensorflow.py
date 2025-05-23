# -*- coding: utf-8 -*-
"""Handwritten Digit Recoginition using Tensorflow.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/19B1aFPOtzf2O3eorvLs46toFt96EmF2X
"""


import tensorflow as tf

"""# **Handwritten Digit Recoginition using Tensorflow**

TensorFlow is a powerful, open-source library primarily used for building and deploying machine learning models, particularly deep learning models, across a range of applications like image recognition, natural language processing, and more.

The MNIST database (Modified National Institute of Standards and Technology database) is a large database of handwritten digits that is commonly used for training various image processing systems.

It contains the 28 x 28 sized images of handwritten 0 to 9




**The MNIST database already exists in tensorflow, it can therefore be loaded using Keras.**

"""

mnist = tf.keras.datasets.mnist

"""**Train and test datasets**"""

(x_train, y_train), (x_test, y_test) = mnist.load_data()

x_train.shape

import matplotlib.pyplot as plt

plt.imshow(x_train[0])
plt.show()
# Convert it into binary image to execute a graph
plt.imshow(x_train[0], cmap=plt.cm.binary)
plt.show()

"""**Color Values of each Pixel**


Before Normalisation
"""

print (x_train[0])
# 0 is black
# 253 is white
# To avoid confusion the graph shown above has a white background because when
# using plt.cm.binary the color values are reverted making black background to
# white, when in reality the picture contains a black background.

"""**Normalizing the Data (Preprocessing)**"""

x_train, x_test = x_train / 255.0, x_test / 255.0
plt.imshow(x_train[0], cmap=plt.cm.binary)
plt.show()

"""After Normalization"""

print (x_train[0])

print (y_train[0])

"""

**Resizing Image for CNN**"""

import numpy as np
img_size = 28
x_trainr = np.array(x_train).reshape(-1, img_size, img_size, 1) # -1 is 60000
x_testr = np.array(x_test).reshape(-1, img_size, img_size, 1) # Create an extra dimension (1) for CNN purposes
print("Training Sample Dimension",x_trainr.shape)
print("Testing Sample Dimension",x_testr.shape)

"""# **Creating the Deep Neural Network**

A filter, or kernel, in a CNN is a small matrix of weights that slides over the input data (such as an image), performs element-wise multiplication with the part of the input it is currently on, and then sums up all the results into a single output pixel.




"""

# Step 1: Install required libraries - !pip install opencv-python matplotlib --quiet

# Step 2: Import necessary libraries
import cv2
import numpy as np
import matplotlib.pyplot as plt
from urllib.request import urlopen
#from google.colab import files

# Step 3: Function to load image from URL
def load_image_from_url(url):
    try:
        resp = urlopen(url)
        image_array = np.asarray(bytearray(resp.read()), dtype="uint8")
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Image could not be decoded.")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image
    except Exception as e:
        print(f"Failed to load image: {e}")
        return None

# Load image from URL
url = 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=640'
image = load_image_from_url(url)


# Step 4: Define filter kernels
sharpen_kernel = np.array([
    [0, -1, 0],
    [-1, 7, -1],
    [0, -1, 0]
])

edge_kernel = np.array([
    [-1, -1, -1],
    [-1,  8, -1],
    [-1, -1, -1]
])

blur_kernel = np.ones((3, 3), np.float32) / 9.0
box_blur_kernel = np.ones((5, 5), np.float32) / 25.0

emboss_kernel = np.array([
    [-2, -1, 0],
    [-1,  1, 1],
    [0,   1, 2]
])

outline_kernel = np.array([
    [1, 1, 1],
    [1, -8, 1],
    [1, 1, 1]
])

# Sobel X (grayscale only)
gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
sobel_x = cv2.convertScaleAbs(sobel_x)

# Step 5: Apply filters
filtered_images = [
    image,
    cv2.filter2D(image, -1, sharpen_kernel),
    cv2.filter2D(image, -1, edge_kernel),
    cv2.filter2D(image, -1, blur_kernel),
    cv2.filter2D(image, -1, box_blur_kernel),
    cv2.filter2D(image, -1, emboss_kernel),
    cv2.filter2D(image, -1, outline_kernel),
    sobel_x
]

titles = [
    'Original',
    'Sharpened',
    'Edge Detection',
    'Blur (3x3)',
    'Box Blur (5x5)',
    'Emboss',
    'Outline',
    'Sobel X'
]

# Step 6: Show results in 2x4 grid
plt.figure(figsize=(15, 8))
for i in range(8):
    plt.subplot(2, 4, i + 1)
    img = filtered_images[i]
    if len(img.shape) == 2:  # Grayscale (Sobel X)
        plt.imshow(cv2.cvtColor(img, cv2.COLOR_GRAY2RGB))
    else:
        plt.imshow(img)
    plt.title(titles[i], fontsize=10)
    plt.axis('off')

plt.tight_layout()
plt.show()

"""Keras Models:

  The Sequential API model is the simplest model and it comprises a linear pile of layers that allows you to configure models layer-by-layer for most problems.

  Functional model is ideal for creating complex models, that require extended flexibility. It allows you to define models that feature layers connect to more than just the previous and next layers.
"""

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense,Dropout,Activation,Flatten,Conv2D,MaxPooling2D

# Neural Network
model = Sequential()

# First Convolutional Layer
model.add(Conv2D(64, (3,3), input_shape = x_trainr.shape[1:])) # first conv layer
model.add(Activation("relu")) # activation function to make it non linear
model.add(MaxPooling2D(pool_size=(2,2))) # Maxpool single maximum value of 2x2 matrix

# Second Convolutional Layer
model.add(Conv2D(64, (3,3))) # second conv layer
model.add(Activation("relu")) # activation function to make it non linear
model.add(MaxPooling2D(pool_size=(2,2))) # Maxpool

# Third Convolutional Layer
model.add(Conv2D(64, (3,3))) # third conv layer
model.add(Activation("relu")) # activation function to make it non linear
model.add(MaxPooling2D(pool_size=(2,2))) # Maxpool

# Fully connected layer 1
model.add (Flatten()) # before using fully connected layer we flatten 2D to 1D
model.add (Dense(64)) #
model.add (Activation("relu"))

# Fully connected layer 2
model.add (Dense(32))
model.add (Activation("relu"))

# Output Layer
model.add (Dense(10))
model.add (Activation("softmax"))

model.summary()

print ("Total Training Sample = ",len(x_trainr))
print ("Total Testing Sample = ",len(x_testr))

model.compile(loss="sparse_categorical_crossentropy", optimizer="adam", metrics=["accuracy"])

model.fit(x_trainr, y_train, epochs=5, validation_split=0.3)

# Evaluating on testing data
test_loss, test_acc = model.evaluate(x_testr, y_test)
print("Test Loss = ",test_loss)
print("Test Accuracy = ",test_acc)

# Predict Model
predictions = model.predict([x_testr])

print(predictions)

plt.imshow(x_test[0], cmap=plt.cm.binary)
plt.show()

print(np.argmax(predictions[0]))

model.save("digit_model_legacy.h5")


