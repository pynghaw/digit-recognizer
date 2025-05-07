import React, { useRef, useState, useEffect } from 'react';

function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Scale factor for X
    const scaleY = canvas.height / rect.height; // Scale factor for Y
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
  
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // Scale factor for X
    const scaleY = canvas.height / rect.height; // Scale factor for Y
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
  
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setImageData(null);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    const base64Image = canvas.toDataURL('image/png');
    setImageData(base64Image);
    console.log('Base64 Image:', base64Image);
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Drawing Pad</h2>
          <p className="text-sm text-gray-500">Draw something using your mouse</p>
        </div>

        <div className="flex justify-center">
          <div className="border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              className="touch-none cursor-crosshair bg-white rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={clearCanvas}
            className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow font-medium"
          >
            Clear Canvas
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow font-medium"
          >
            Save Drawing
          </button>
        </div>

        {imageData && (
          <div className="flex flex-col items-center space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700">Preview</h3>
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
              <img
                src={imageData}
                alt="Drawing preview"
                className="w-32 h-32 object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawingCanvas; 