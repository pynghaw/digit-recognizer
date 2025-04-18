# 🧠 Airost Handwritten Digit Recognizer (TensorFlow.js + React)
🔗Link: https://digit-recognizer-eta.vercel.app/

This is a web-based handwritten digit recognition app built with a trained TensorFlow CNN model and deployed using a simple React UI. The model runs entirely in the browser using TensorFlow.js.

---

## 🧩 Features

- Users can draw digits (0–9) on a canvas.
- Predictions are made instantly in the browser.
- No backend required — everything runs in the frontend.

---

## ⚙️ How to Set Up and Reproduce This Project

### ✅ Step 1: Create and Activate Virtual Environment

```bash
# Create virtual environment
python3.11.8 -m venv tfjsenv

# Activate on Windows
.\tfjsenv\Scripts\activate
```

### ✅ Step 2: Install Dependencies
Create  a <b>'requirements.txt'</b>, below contains the specific version i use.
```bash
tensorflow==2.12.0
tensorflowjs==3.18.0
protobuf<=3.20.3
numpy==1.23.5
opencv-python
matplotlib
```
Then, install the required Python packages using:
```bash
pip install -r requirements.txt
```


### ✅ Step 3: Run the Training Script
Train your model and export it to TensorFlow.js format.
```bash
# Save your trained model
model.save("digit_model.h5")
```

Then run the following command in your terminal to convert the model:
```bash
tensorflowjs_converter --input_format keras digit_model.h5 tfjs_model
```

This will generate the following structure:
```bash
tfjs_model/
├── model.json
└── group1-shard1of1.bin
```

### ✅ Step 4: Create a React Project and move Converted Model to Public Directory
Copy the tfjs_model folder into your React project’s `public/` directory:

```bash
my-react-app/
├── public/
│   ├── index.html
│   └── tfjs_model/
│       ├── model.json
│       └── group1-shard1of1.bin
```
### ✅ Step 5: Design the UI and Load the Model
Refer to the codes in the repo.

### 🌐 Deploying to Vercel (optional)

---

### 🚧 Problems Faced & Solutions

### 1. TensorFlow/Keras Version Incompatibility

Initially, the model was trained and saved using **Keras 3.x** in Google Colab. However, `tensorflowjs_converter` is **not compatible with models saved using Keras 3.x** — it expects models in **Keras 2.x format**.

✅ **What I tried:**
- Re-saving the model using `.h5` or `.keras` extensions — but Keras 3.x does not support true downgrading.
- Downgrading TensorFlow and Keras directly in Google Colab, but Colab's environment did not allow proper control over package versions.

✅ **Final Solution:**
- Switched to **VS Code** and created a fresh virtual environment manually.
- Installed **specific compatible versions** of TensorFlow and Keras.
