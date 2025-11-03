
import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
    value?: string;
    onChange: (dataUrl: string) => void;
    disabled?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange, disabled }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);

    const getCanvasContext = () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.getContext('2d');
    };

    const clearCanvas = () => {
        const ctx = getCanvasContext();
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            onChange('');
            setHasSigned(false);
        }
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size based on its container to make it responsive
        const resizeCanvas = () => {
            const rect = canvas.parentElement!.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = 200; // Fixed height
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);
    
    useEffect(() => {
        if (value) {
            setHasSigned(true);
        }
    }, [value]);

    const getCoords = (e: MouseEvent | TouchEvent): { x: number, y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if (window.TouchEvent && e instanceof TouchEvent) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else if (e instanceof MouseEvent) {
             return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        return { x: 0, y: 0 };
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const ctx = getCanvasContext();
        if (!ctx) return;

        const { x, y } = getCoords(e.nativeEvent);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#334155'; // slate-700
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = getCanvasContext();
        if (!ctx) return;

        const { x, y } = getCoords(e.nativeEvent);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        if (!isDrawing || !canvas) return;
        setIsDrawing(false);
        setHasSigned(true);
        onChange(canvas.toDataURL('image/png'));
    };

    if (disabled) {
        return value ? (
            <img src={value} alt="Signature" className="border rounded-md bg-white" />
        ) : (
            <div className="p-3 bg-slate-100 rounded-md text-sm text-slate-400">No signature provided.</div>
        );
    }
    
    return (
        <div className="w-full">
            <div className="relative border border-slate-300 rounded-md touch-none bg-white">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasSigned && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
                        Sign here
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={clearCanvas}
                className="mt-2 px-3 py-1 text-sm font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
            >
                Clear
            </button>
        </div>
    );
};

export default SignaturePad;
