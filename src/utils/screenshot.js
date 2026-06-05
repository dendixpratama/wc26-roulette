import html2canvas from 'html2canvas';

/**
 * Takes a screenshot of the given element and triggers a download
 */
export async function takeScreenshot(element, filename = 'hasil-undian-wc2026.png') {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0a1a',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    return true;
  } catch (e) {
    console.error('Screenshot failed:', e);
    return false;
  }
}
