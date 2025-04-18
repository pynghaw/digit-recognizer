import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';


function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set the canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Scale for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    context.strokeStyle = '#2c3e50';
    context.lineWidth = 25;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    contextRef.current = context;

    // Load the model
    tf.loadLayersModel('/tfjs_model/model.json')
    .then((loadedModel) => {
      setModel(loadedModel);
      console.log("✅ Model loaded!");
    })
    .catch((err) => console.error("❌ Error loading model:", err));
  }, []);

  const startDrawing = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX / scaleX, offsetY / scaleY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.lineTo(offsetX / scaleX, offsetY / scaleY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    setPrediction(null);
  };

  const predict = async () => {
    if (!model) {
      alert("Model not loaded yet.");
      return;
    }
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    // Get pixel data from canvas and resize it to 28x28
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let tensor = tf.browser.fromPixels(imageData, 1) // 1 for grayscale
      .resizeNearestNeighbor([28, 28])
      .toFloat()
      .div(255.0)
      .expandDims(0); // shape becomes [1, 28, 28, 1]
  
    // DEBUG: visualize preprocessed tensor
    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = 28;
    previewCanvas.height = 28;
    document.body.appendChild(previewCanvas);
    await tf.browser.toPixels(tensor.squeeze(), previewCanvas);
  
    // Predict using the model
    const prediction = model.predict(tensor);
    const predictedDigit = prediction.argMax(-1).dataSync()[0];
  
    // Display prediction
    setPrediction(predictedDigit);
    console.log("Raw prediction data:", await prediction.data());
  };
  
  

  return (
    <div className="drawing-app">
      <h1 className="app-title">Airost Handwritten Digit Recognition</h1>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="drawing-canvas"
        />
      </div>
      
      <div className="button-group">
        <button className="button" onClick={clearCanvas}>
          Clear
        </button>
        <button className="button secondary" onClick={predict}>
          Predict
        </button>
      </div>

      {prediction && (
        <div className="prediction-result card fade-in">
          <h3>Prediction Result</h3>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}

export default App;
