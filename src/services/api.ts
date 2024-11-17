const API_URL = 'https://your-api-domain.com';

export const convertFile = async (file, targetFormat) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  });
  formData.append('targetFormat', targetFormat);

  const response = await fetch(`${API_URL}/convert`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    throw new Error('转换失败');
  }

  return response;
};