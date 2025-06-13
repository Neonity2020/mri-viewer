import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// 定义序列类型
type SequenceType = 'Axial-T2WI' | 'Axial-T1WI' | 'Axial-FLAIR' | 'Axial-DWI' | 'Axial-SWI' | 'Sag-T2WI';

interface Sequence {
  name: SequenceType;
  preview: string;
}

function App() {
  const [selectedSequence, setSelectedSequence] = useState<SequenceType>('Axial-T2WI');
  const [currentSlice, setCurrentSlice] = useState(13);
  const [totalSlices, setTotalSlices] = useState(28);
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowLevel, setWindowLevel] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const lastMousePos = React.useRef({ x: 0, y: 0 });
  
  // 所有可用的序列
  const sequences: Sequence[] = [
    { name: 'Axial-T2WI', preview: '/normal-mri-brain-3/Axial-T2WI/normal-mri-brain-3-axial-t2wi-13.jpg' },
    { name: 'Axial-T1WI', preview: '/normal-mri-brain-3/Axial-T1WI/normal-mri-brain-3-axial-t1wi-13.jpg' },
    { name: 'Axial-FLAIR', preview: '/normal-mri-brain-3/Axial-FLAIR/normal-mri-brain-3-axial-flair-01.jpeg' },
    { name: 'Axial-DWI', preview: '/normal-mri-brain-3/Axial-DWI/normal-mri-brain-3-axial-dwi-13.jpg' },
    { name: 'Axial-SWI', preview: '/normal-mri-brain-3/Axial-SWI/normal-mri-brain-3-axial-swi-01.jpeg' },
    { name: 'Sag-T2WI', preview: '/normal-mri-brain-3/Sag-T2WI/normal-mri-brain-3-sag-t2wi-13.jpg' },
  ];

  // 当序列切换时，更新总切片数并重置当前切片
  const handleSelectSequence = (sequenceName: SequenceType) => {
    setSelectedSequence(sequenceName);
    // 假设所有序列都有28张图片，您可以根据实际情况修改
    const sliceCounts: Record<SequenceType, number> = {
      'Axial-T2WI': 28, 'Axial-T1WI': 28, 'Axial-FLAIR': 6, 
      'Axial-DWI': 28, 'Axial-SWI': 6, 'Sag-T2WI': 28,
    };
    setTotalSlices(sliceCounts[sequenceName] || 1);
    
    // T2WI从第13张开始，其他从第1张开始
    setCurrentSlice(sequenceName === 'Axial-T2WI' ? 13 : 1);
  };

  // 重置视图
  const handleResetView = () => {
    setWindowWidth(400);
    setWindowLevel(200);
    setScale(1);
    setPan({ x: 0, y: 0 });
    // T2WI重置到13，其他重置到1
    setCurrentSlice(selectedSequence === 'Axial-T2WI' ? 13 : 1);
  };

  // 获取当前图片的路径
  const getCurrentImagePath = () => {
    const sequenceInfo: Record<string, {prefix: string, ext: string}> = {
      'Axial-T2WI': { prefix: 'normal-mri-brain-3-axial-t2wi', ext: 'jpg' },
      'Axial-T1WI': { prefix: 'normal-mri-brain-3-axial-t1wi', ext: 'jpg' },
      'Axial-FLAIR': { prefix: 'normal-mri-brain-3-axial-flair', ext: 'jpeg' },
      'Axial-DWI': { prefix: 'normal-mri-brain-3-axial-dwi', ext: 'jpg' },
      'Axial-SWI': { prefix: 'normal-mri-brain-3-axial-swi', ext: 'jpeg' },
      'Sag-T2WI': { prefix: 'normal-mri-brain-3-sag-t2wi', ext: 'jpg' },
    };
    const info = sequenceInfo[selectedSequence];
    if (info) {
      const sliceNumber = currentSlice.toString().padStart(2, '0');
      return `/normal-mri-brain-3/${selectedSequence}/${info.prefix}-${sliceNumber}.${info.ext}`;
    }
    return '';
  };

  // 处理切片切换
  const handleSliceChange = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSlice > 1) {
      setCurrentSlice(prev => prev - 1);
    } else if (direction === 'next' && currentSlice < totalSlices) {
      setCurrentSlice(prev => prev + 1);
    }
  }, [currentSlice, totalSlices]);

  // 处理鼠标滚轮事件 (切片浏览或缩放)
  const handleWheel = useCallback((event: Event) => {
    const wheelEvent = event as WheelEvent;
    wheelEvent.preventDefault();
    
    if (wheelEvent.ctrlKey) { // 按住Ctrl键进行缩放
      const zoomFactor = 0.1;
      if (wheelEvent.deltaY < 0) {
        setScale(prev => prev + zoomFactor);
      } else {
        setScale(prev => Math.max(0.2, prev - zoomFactor));
      }
    } else { // 否则进行切片浏览
      if (wheelEvent.deltaY > 0) {
        handleSliceChange('next');
      } else {
        handleSliceChange('prev');
      }
    }
  }, [handleSliceChange]);

  // 添加和移除滚轮事件监听器
  useEffect(() => {
    const imageContainer = document.querySelector('.image-container');
    if (imageContainer) {
      imageContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        imageContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // 添加和移除空格键事件监听器
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacebarPressed) {
        e.preventDefault(); // 防止页面滚动
        setIsSpacebarPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacebarPressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacebarPressed]);

  // 处理窗宽窗位和图像平移的拖动
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.button === 0) { // 左键
      if (isSpacebarPressed) {
        setIsPanning(true);
      } else {
        setIsDragging(true);
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (e.button === 2) { // 右键拖动 -> 平移 (保留给鼠标用户)
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;

      if (isDragging) {
        setWindowWidth(prev => Math.max(1, prev + deltaX));
        setWindowLevel(prev => Math.max(1, prev + deltaY));
      } else if (isPanning) {
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsPanning(false);
    };

    if (isDragging || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isPanning]);

  // 根据窗宽窗位和缩放计算图像样式
  const getImageStyle = () => {
    const contrast = 400 / windowWidth;
    const brightness = windowLevel / 200;
    return {
      filter: `contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`,
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale.toFixed(2)})`,
    };
  };

  return (
    <div className="mri-viewer">
      {/* 序列选择区 */}
      <div className="sequence-selector">
        {sequences.map((sequence) => (
          <button
            key={sequence.name}
            className={`sequence-button ${selectedSequence === sequence.name ? 'active' : ''}`}
            onClick={() => handleSelectSequence(sequence.name)}
          >
            <div className="preview-image-container">
              {sequence.preview ? (
                <img src={sequence.preview} alt={`${sequence.name} preview`} className="preview-image" />
              ) : (
                <div className="preview-placeholder">
                  <span>暂无预览</span>
                </div>
              )}
            </div>
            <span className="sequence-name">{sequence.name}</span>
          </button>
        ))}
      </div>

      {/* 主图像显示区 */}
      <div className="main-viewer">
        <div 
          className={`image-container ${isDragging ? 'dragging' : ''} ${isPanning ? 'panning' : ''} ${isSpacebarPressed && !isPanning && !isDragging ? 'space-pressed' : ''}`}
          onMouseDown={handleMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          {getCurrentImagePath() ? (
            <>
              <button 
                className="slice-nav-button prev"
                onClick={() => handleSliceChange('prev')}
                disabled={currentSlice === 1}
              >
                ←
              </button>
              <img 
                src={getCurrentImagePath()} 
                alt={`Slice ${currentSlice}`}
                className="mri-image"
                style={getImageStyle()}
                onDragStart={(e) => e.preventDefault()}
              />
              <button 
                className="slice-nav-button next"
                onClick={() => handleSliceChange('next')}
                disabled={currentSlice === totalSlices}
              >
                →
              </button>
              <div className="slice-info">
                {currentSlice} / {totalSlices}
              </div>
              <div className="window-info">
                WW: {Math.round(windowWidth)} / WL: {Math.round(windowLevel)}
              </div>
              <div className="zoom-info">
                Zoom: {Math.round(scale * 100)}%
              </div>
              <button className="reset-button" onClick={handleResetView} title="Reset View">
                ↺
              </button>
            </>
          ) : (
            <div className="placeholder-image">
              <p>图像显示区域</p>
              <p>当前序列: {selectedSequence}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
