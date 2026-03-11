// frontend/src/hooks/ai/useAITools.js
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiAPI } from '@/services/api/aiAPI';
import toast from 'react-hot-toast';

export function useAITools() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const removeBackground = useMutation({
    mutationFn: (imageFile) => aiAPI.removeBackground(imageFile),
    onMutate: () => {
      setIsProcessing(true);
      setProgress(0);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Background removed!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove background');
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(100);
    }
  });

  const enhanceImage = useMutation({
    mutationFn: ({ imageFile, type }) => aiAPI.enhanceImage(imageFile, type),
    onMutate: () => {
      setIsProcessing(true);
      setProgress(0);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Image enhanced!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to enhance image');
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(100);
    }
  });

  const upscaleImage = useMutation({
    mutationFn: ({ imageFile, scale }) => aiAPI.upscaleImage(imageFile, scale),
    onMutate: () => {
      setIsProcessing(true);
      setProgress(0);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Image upscaled ${data.scale}x!`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upscale image');
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(100);
    }
  });

  const generateImage = useMutation({
    mutationFn: (options) => aiAPI.generateImage(options),
    onMutate: () => {
      setIsProcessing(true);
      setProgress(0);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Image generated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate image');
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(100);
    }
  });

  const styleTransfer = useMutation({
    mutationFn: ({ contentFile, styleFile }) => aiAPI.styleTransfer(contentFile, styleFile),
    onMutate: () => {
      setIsProcessing(true);
      setProgress(0);
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success('Style applied!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to apply style');
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(100);
    }
  });

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setResult(null);
  }, []);

  return {
    isProcessing,
    progress,
    result,
    reset,
    removeBackground: removeBackground.mutate,
    enhanceImage: enhanceImage.mutate,
    upscaleImage: upscaleImage.mutate,
    generateImage: generateImage.mutate,
    styleTransfer: styleTransfer.mutate,
    isRemovingBackground: removeBackground.isPending,
    isEnhancing: enhanceImage.isPending,
    isUpscaling: upscaleImage.isPending,
    isGenerating: generateImage.isPending,
    isStyleTransferring: styleTransfer.isPending
  };
}

export default useAITools;