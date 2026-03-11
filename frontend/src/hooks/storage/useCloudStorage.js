// frontend/src/hooks/storage/useCloudStorage.js
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageAPI } from '@/services/api/storageAPI';
import toast from 'react-hot-toast';

export function useCloudStorage() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState({});

  // Get storage usage
  const { data: usage, isLoading: loadingUsage } = useQuery({
    queryKey: ['storage-usage'],
    queryFn: storageAPI.getUsage,
    staleTime: 60000
  });

  // Upload file
  const uploadFile = useCallback(async (file, folder = 'root') => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // Get presigned URL
      const { uploadUrl, key } = await storageAPI.getPresignedUploadUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size
      });

      // Upload to S3
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Create asset record
      const asset = await storageAPI.createAsset({
        name: file.name,
        originalName: file.name,
        type: file.type.split('/')[0],
        mimeType: file.type,
        size: file.size,
        storageKey: key,
        folder
      });

      // Invalidate queries
      queryClient.invalidateQueries(['assets']);
      queryClient.invalidateQueries(['storage-usage']);

      toast.success('File uploaded!');
      return asset;
    } catch (error) {
      toast.error('Upload failed');
      throw error;
    } finally {
      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [queryClient]);

  // Delete files
  const deleteFiles = useMutation({
    mutationFn: (keys) => storageAPI.deleteFiles(keys),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      queryClient.invalidateQueries(['storage-usage']);
      toast.success('Files deleted');
    },
    onError: () => {
      toast.error('Failed to delete files');
    }
  });

  // Move files
  const moveFiles = useMutation({
    mutationFn: ({ assetIds, targetFolder }) => storageAPI.moveFiles(assetIds, targetFolder),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      toast.success('Files moved');
    },
    onError: () => {
      toast.error('Failed to move files');
    }
  });

  return {
    usage: usage?.data,
    loadingUsage,
    uploadProgress,
    uploadFile,
    deleteFiles: deleteFiles.mutate,
    moveFiles: moveFiles.mutate,
    isDeletingFiles: deleteFiles.isPending,
    isMovingFiles: moveFiles.isPending
  };
}

export default useCloudStorage;