import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// 定义序列类型
type SequenceType = 'Axial-T2WI' | 'Axial-T1WI' | 'Axial-FLAIR' | 'Axial-DWI' | 'Axial-SWI-MinIP' | 'Sag-T1WI';

// 定义需要自动缩放以适应容器的序列列表
const AUTOSCALE_SEQUENCES: SequenceType[] = ['Axial-FLAIR', 'Axial-SWI-MinIP', 'Axial-DWI', 'Sag-T1WI'];

// 为自动缩放的序列设置垂直方向的padding，以调整其视觉高度
// 您可以修改这个值来改变这些序列上下留出的空隙大小
const AUTOSCALE_VERTICAL_PADDING = 40; // 单位: 像素

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
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // 所有可用的序列
  const sequences: Sequence[] = [
    { name: 'Axial-T2WI', preview: '/normal-mri-brain-3/Axial-T2WI/normal-mri-brain-3-axial-t2wi-13.jpg' },
    { name: 'Axial-T1WI', preview: '/normal-mri-brain-3/Axial-T1WI/normal-mri-brain-3-axial-t1wi-13.jpg' },
    { name: 'Axial-FLAIR', preview: '/normal-mri-brain-3/Axial-FLAIR/normal-mri-brain-3-axial-flair-13.jpg' },
    { name: 'Axial-DWI', preview: '/normal-mri-brain-3/Axial-DWI/normal-mri-brain-3-axial-dwi-13.jpg' },
    { name: 'Axial-SWI-MinIP', preview: '/normal-mri-brain-3/Axial-SWI/normal-mri-brain-3-axial-swi-13.jpg' },
    { name: 'Sag-T1WI', preview: '/normal-mri-brain-3/Sag-T1WI/normal-mri-brain-3-sag-t1wi-13.jpg' },
  ];

  const updateScale = useCallback(() => {
    if (
      AUTOSCALE_SEQUENCES.includes(selectedSequence) &&
      imageRef.current &&
      imageContainerRef.current
    ) {
      const { naturalHeight } = imageRef.current;
      const { clientHeight } = imageContainerRef.current;
      if (naturalHeight > 0 && clientHeight > 0) {
        const targetHeight = clientHeight - AUTOSCALE_VERTICAL_PADDING;
        const newScale = targetHeight > 0 ? targetHeight / naturalHeight : 1;
        setScale(newScale);
      }
    } else {
      // For all other sequences or if refs are not ready, set to default
      setScale(1);
    }
  }, [selectedSequence]);

  // Update scale on resize
  useEffect(() => {
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, [updateScale]);

  // 当序列切换时，更新总切片数并重置当前切片
  const handleSelectSequence = (sequenceName: SequenceType) => {
    // 只有当切换到不同序列时才重置缩放，以防止不必要的闪烁
    if (sequenceName !== selectedSequence) {
      setScale(1); // Reset scale first to avoid flicker
    }
    setSelectedSequence(sequenceName);
    // 假设所有序列都有28张图片，您可以根据实际情况修改
    const sliceCounts: Record<SequenceType, number> = {
      'Axial-T2WI': 28, 'Axial-T1WI': 28, 'Axial-FLAIR': 28, 
      'Axial-DWI': 25, 'Axial-SWI-MinIP': 64, 'Sag-T1WI': 22,
    };
    setTotalSlices(sliceCounts[sequenceName] || 1);
    
    // 序列从第13张开始
    setCurrentSlice(sequenceName === 'Axial-T2WI' || sequenceName === 'Axial-T1WI' || sequenceName === 'Axial-FLAIR' || sequenceName === 'Axial-DWI' || sequenceName === 'Axial-SWI-MinIP' || sequenceName === 'Sag-T1WI' ? 13 : 1);
  };

  // 重置视图
  const handleResetView = useCallback(() => {
    setWindowWidth(400);
    setWindowLevel(200);
    setScale(1); // Reset scale first for consistency
    setPan({ x: 0, y: 0 });
    setCurrentSlice(selectedSequence === 'Axial-T2WI' || selectedSequence === 'Axial-T1WI' || selectedSequence === 'Axial-FLAIR' || selectedSequence === 'Axial-DWI' || selectedSequence === 'Axial-SWI-MinIP' || selectedSequence === 'Sag-T1WI' ? 13 : 1);
    // Update scale on reset
    updateScale();
  }, [selectedSequence, updateScale]);

  // 获取当前图片的路径
  const getCurrentImagePath = () => {
    const sequenceInfo: Record<string, {prefix: string, ext: string, directory: string}> = {
      'Axial-T2WI': { prefix: 'normal-mri-brain-3-axial-t2wi', ext: 'jpg', directory: 'Axial-T2WI' },
      'Axial-T1WI': { prefix: 'normal-mri-brain-3-axial-t1wi', ext: 'jpg', directory: 'Axial-T1WI' },
      'Axial-FLAIR': { prefix: 'normal-mri-brain-3-axial-flair', ext: 'jpg', directory: 'Axial-FLAIR' },
      'Axial-DWI': { prefix: 'normal-mri-brain-3-axial-dwi', ext: 'jpg', directory: 'Axial-DWI' },
      'Axial-SWI-MinIP': { prefix: 'normal-mri-brain-3-axial-swi', ext: 'jpg', directory: 'Axial-SWI' },
      'Sag-T1WI': { prefix: 'normal-mri-brain-3-sag-t1wi', ext: 'jpg', directory: 'Sag-T1WI' },
    };
    const info = sequenceInfo[selectedSequence];
    if (info) {
      const sliceNumber = currentSlice.toString().padStart(2, '0');
      return `/normal-mri-brain-3/${info.directory}/${info.prefix}-${sliceNumber}.${info.ext}`;
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

  // 添加和移除键盘事件监听器
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacebarPressed) {
        e.preventDefault(); // 防止页面滚动
        setIsSpacebarPressed(true);
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
        e.preventDefault(); // 防止页面滚动
        handleSliceChange('prev');
      } else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
        e.preventDefault(); // 防止页面滚动
        handleSliceChange('next');
      } else if (e.code === 'KeyR') {
        handleResetView();
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
  }, [isSpacebarPressed, handleSliceChange, handleResetView]);

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
          ref={imageContainerRef}
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
                ref={imageRef}
                src={getCurrentImagePath()} 
                alt={`Slice ${currentSlice}`}
                className="mri-image"
                style={getImageStyle()}
                onLoad={updateScale}
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
      <div className="attribution">
        Case courtesy of Mohd Radhwan Bin Abidin, <a href="https://radiopaedia.org/" target="_blank" rel="noopener noreferrer">Radiopaedia.org</a>. From the case <a href="https://radiopaedia.org/cases/153576" target="_blank" rel="noopener noreferrer">rID: 153576</a>
      </div>
      <details className="details">
        <summary>Case Details 案例详情</summary>
        <div className="case-description">No abnormal signal intensity of brain parenchyma. The white and grey matter differentiation are normal. No restricted diffusion. No blooming artefact on SWI. No hydrocephalus. </div>
        <div className="case-description">脑实质信号强度无异常。白质和灰质分化正常。无扩散受限。SWI上无血管造影。无脑积水。 </div>
      </details>
    </div>
  );
}

export default App;
