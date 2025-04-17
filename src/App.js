import React, { useRef, useEffect, useState } from 'react';

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);

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
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    contextRef.current = context;
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

  const predict = () => {
    // Placeholder for prediction functionality
    setPrediction("Sample prediction result");
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
