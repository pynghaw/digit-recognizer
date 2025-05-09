import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';


function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [model, setModel] = useState(null);
  const [rawOutput, setRawOutput] = useState([]);


  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
        
    // Scale for high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    context.scale(dpr, dpr);
    
    // Set drawing styles
    context.strokeStyle = '#2c3e50';
    context.lineWidth = 18;
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
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.lineTo(offsetX, offsetY);
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
    
    // Check if canvas is empty
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hasDrawing = Array.from(pixelData).some(channel => channel !== 0);
    
    if (!hasDrawing) {
      setPrediction("Draw something first!");
      return;
    }

    try {
      // Clear any existing preview canvas
      const existingPreview = document.getElementById('preview-canvas');
      if (existingPreview) {
        existingPreview.remove();
      }
      
      // Create a temporary canvas for preprocessing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 28;
      tempCanvas.height = 28;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Draw the original content scaled down to 28x28
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, 28, 28);
      tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 28, 28);
      
      // Threshold and invert the image - MNIST typically uses white digits on black background
      const imgData = tempCtx.getImageData(0, 0, 28, 28);
      const data = imgData.data;
      
      // Check if there's anything drawn in the temporary canvas
      let hasContent = false;
      for (let i = 0; i < data.length; i += 4) {
        // If any pixel isn't white (255,255,255), there's content
        if (data[i] < 240 || data[i+1] < 240 || data[i+2] < 240) {
          hasContent = true;
          break;
        }
      }
      
      if (!hasContent) {
        setPrediction("No visible content detected after scaling. Try drawing with darker strokes.");
        return;
      }
      
      // Process the image for MNIST format (black background, white digit)
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale first
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Threshold to make it black or white
        const value = avg < 200 ? 255 : 0; // If dark, make it white (digit); if light, make it black (background)
        
        // Set RGB channels
        data[i] = data[i + 1] = data[i + 2] = value;
        data[i + 3] = 255; // Full alpha
      }
      
      // Update the temporary canvas with processed data
      tempCtx.putImageData(imgData, 0, 0);
      
      // Get tensor from processed canvas - using the processed image data
      const tensor = tf.browser.fromPixels(imgData, 1)
        .expandDims(0)
        .toFloat()
        .div(255.0);
    
      // Predict using the model
      const prediction = model.predict(tensor);

      // Get the raw output as an array
      const rawOutputData = Array.from(prediction.dataSync());
      setRawOutput(rawOutputData);
      console.log("Raw model output:", rawOutputData);

      // Get the digit with the highest probability
      const predictedDigit = prediction.argMax(-1).dataSync()[0];
      const predictedProbability = rawOutputData[predictedDigit];

      // Set prediction
      setPrediction(`${predictedDigit} (${(predictedProbability * 100).toFixed(2)}%)`);

    } catch (error) {
      console.error("Error during prediction:", error);
      setPrediction("Error during prediction. See console.");
    }
  };
   

  return (
    <div className="drawing-app">
      <h1 className="app-title">Digit Recoginzer</h1>
      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
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
        </div>

        {/* Right Panel (always there) */}
        <div className="right-panel">
          {prediction ? (
            <div className="prediction-result card fade-in">
              <h3>Prediction Result</h3>
              <h4>{prediction}</h4>

              {rawOutput.length > 0 && (
                rawOutput.map((val, index) => (
                  <p key={index}>
                    {index}: {(val * 100).toFixed(2)}%
                  </p>
                ))
              )}
            </div>
          ) : (
            <div className="placeholder card">
              <p>No Prediction</p>
            </div>
          )}
        </div>
      </div>              
    </div>
  );
}

export default App;
