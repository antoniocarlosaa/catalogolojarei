import React, { useState, useEffect } from 'react';

interface ImageLightboxProps {
    src: string;
    alt: string;
    onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Reset zoom/position when src changes
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [src]);

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        if (e.deltaY < 0) {
            setScale(prev => Math.min(prev + 0.5, 5)); // Zoom In
        } else {
            setScale(prev => Math.max(prev - 0.5, 1)); // Zoom Out
        }
    };

    const toggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale(prev => prev === 1 ? 2.5 : 1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300"
            onClick={onClose}
            onWheel={handleWheel}
        >
            {/* Close Button */}
            <button
                className="absolute top-6 right-6 z-[210] w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all border border-white/10"
                onClick={onClose}
            >
                <span className="material-symbols-outlined">close</span>
            </button>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-[210]">
                <button
                    className="w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all border border-white/10"
                    onClick={(e) => { e.stopPropagation(); setScale(prev => Math.max(prev - 0.5, 1)); }}
                >
                    <span className="material-symbols-outlined">remove</span>
                </button>
                <button
                    className="w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all border border-white/10"
                    onClick={toggleZoom}
                >
                    <span className="material-symbols-outlined">{scale === 1 ? 'zoom_in' : 'zoom_out'}</span>
                </button>
                <button
                    className="w-12 h-12 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all border border-white/10"
                    onClick={(e) => { e.stopPropagation(); setScale(prev => Math.min(prev + 0.5, 5)); }}
                >
                    <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            {/* Image Container */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full transition-transform duration-200 ease-out select-none pointer-events-none" // pointer-events-none on img allows dragging on parent
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        cursor: scale > 1 ? 'grab' : 'default'
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export default ImageLightbox;
