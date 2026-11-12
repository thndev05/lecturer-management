import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { buildExport, type ExportFormat } from './export-data';
import type { Lecturer } from './data';

export async function exportLecturers(data: Lecturer[], format: ExportFormat) {
  const { filename, mimeType, uti, content } = buildExport(data, format);
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    if (!(await Sharing.isAvailableAsync())) throw new Error('sharing');
    const file = new File(Paths.cache, filename);
    await file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType, UTI: uti });
  }
}
